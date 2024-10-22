const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
let CKEditorInstance = null;
let selectedDate = getCurrentDateFormatted();

const setupDailyBalance = async () => {
    try {
        showLoader();
        const dailyBalanceData = await fetchDailyBalance(selectedDate);
        await initializeEditor('balance-editor', dailyBalanceData?.balance || '');
    } catch (error) {
        console.error('Error al cargar el balance del día:', error);
    } finally {
        hideLoader();
    }
};

// Obtener el token desde las cookies
const getUserToken = () => {
    const userToken = document.cookie.split('; ')
        .find(row => row.startsWith('userToken='))
        .split('=')[1];
    return userToken;
};

// Obtener la síntesis del día
const fetchDailyBalance = async (date) => {
    const graphqlQuery = `
        query getBalanceByDate($date: String!) {
            getBalanceByFecha(fecha: $date){
                balance
                fecha
            }  
        }
    `;
    const userToken = getUserToken();
    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${userToken}`,
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: { date }
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.getBalanceByFecha) {
            return "";
        }

        return data.data.getBalanceByFecha;
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        return "";
    }
};

// Inicializar CKEditor
const initializeEditor = async (textareaId, balanceText) => {
    if (CKEditorInstance) {
        try {
            await CKEditorInstance.destroy();
        } catch (error) {
            console.error("Error al destruir la instancia del editor.", error);
        }
    }

    try {
        const newEditor = await ClassicEditor.create(document.querySelector(`#${textareaId}`));
        CKEditorInstance = newEditor;
        newEditor.setData(balanceText);
        let initialContent = newEditor.getData();
        setupEditorEvents(initialContent);
    } catch (error) {
        console.error("Error al inicializar el editor.", error);
    }
};


// Configura eventos para la instancia actual del editor
const setupEditorEvents = async (initialContent) => {
    const saveButton = document.getElementById('save-button');
    CKEditorInstance.model.document.on('change:data', () => {
        const currentContent = CKEditorInstance.getData();
        if (currentContent !== initialContent) {
            if (saveButton) {
                saveButton.disabled = false; // Habilitar el botón si hay cambios
            }
        } else {
            if (saveButton) {
                saveButton.disabled = true; // Deshabilitar el botón si no hay cambios
            }
        }
    });
};

// Configura evento del botón de guardar
const setupButtonEvent = () => {
    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', async () => {
        try {
            showLoader();
            const balance = CKEditorInstance.getData();
            if (balance === '') {
                await deleteDailyBalance(selectedDate);
            } else {
                await saveDailyBalance(balance, selectedDate);
            }
        } catch (error) {
            console.error('Error al guardar el balance:', error);
        } finally {
            await setupDailyBalance(selectedDate);
            saveButton.disabled = true;
            hideLoader();
        }
    });
};

// Guarda los datos del balance en la db
const saveDailyBalance = async (balance, date) => {
    const graphqlMutation = `
        mutation createOrUpdateBalance(
            $balance: String!
            $fecha: String!
        ) {
            createOrUpdateBalance(
                balance: $balance
                fecha: $fecha
            )
        }
    `;

    const userToken = getUserToken();

    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${userToken}`,
            },
            body: JSON.stringify({
                query: graphqlMutation,
                variables: { balance, fecha: date }
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.createOrUpdateBalance) {
            throw new Error('Error al guardar el balance');
        }

        return data.data.createOrUpdateBalance;
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        throw error;
    }
};

// Eliminar el balance
const deleteDailyBalance = async (date) => {
    const graphqlMutation = `
        mutation deleteBalance($fecha: String!) {
            deleteBalance(fecha: $fecha)  
        }
    `;

    const userToken = getUserToken();

    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${userToken}`,
            },
            body: JSON.stringify({
                query: graphqlMutation,
                variables: { fecha: date }
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.deleteBalance) {
            throw new Error('Error al eliminar el balance');
        }
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        throw error;
    }
};

// ------------------------------ Funcionalidad del loader ----------------------------------
const showLoader = () => {
    const loader = document.getElementById('loader');
    const CKEditor = document.getElementById('daily-balance-editor');
    const dateContainer = document.getElementById('date-container');
    dateContainer.style.display = 'none';
    CKEditor.style.display = 'none';
    loader.style.display = 'block';
};

const hideLoader = () => {
    const loader = document.getElementById('loader');
    const CKEditor = document.getElementById('daily-balance-editor');
    const dateContainer = document.getElementById('date-container');
    loader.style.display = 'none';
    CKEditor.style.display = 'block';
    dateContainer.style.display = 'flex';
};

// ----------------------------------------------------------------

$(document).ready(function () {
    $('#date').val(selectedDate);

    $('#date').datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: -105,
        maxDate: 0,
        onSelect: function (dateText) {
            selectedDate = dateText;
            setupDailyBalance();
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    setupDailyBalance(selectedDate);
    setupButtonEvent();
});
