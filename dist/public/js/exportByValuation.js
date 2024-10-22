// ------------------------------ Tabla de valoración ----------------------------------
// Configuración inicial
const setupValuationTable = async (date) => {
    // Mostrar loader
    showLoader();

    try {
        const valuationData = await fetchValuationInfo(date);
        const valuationRows = generateValuationRows(valuationData);
        if ($.fn.DataTable.isDataTable('#valuation-info')) {
            $('#valuation-info').DataTable().destroy();
        }
        updateValuationTable(valuationRows);
        initializeValuationDataTable();
        setupDeleteEvent(date);
    } catch (error) {
        console.error('Error al cargar los datos de valoración:', error);
    } finally {
        // Ocultar loader después de que se complete la carga
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

// Obtener la información de valoración
const fetchValuationInfo = async (date) => {
    const graphqlQuery = `
        query getDataForTable($date: String!) {
            getDataForTable(fecha: $date) {
                CAPCLAVE
                FECHA
                HORA
                FAMDESCRIPCION
                FESDESCRIPCION
                FNODESCRIPCION
                FNODIASEMISION
                FREHORARIO
                FREFRECUENCIA
                FREBANDA
                FTECONDUCTOR
                FCADESCRIPCION
                FPRDESCRIPCION
                FRESIGLAS
                MUNNOMMUNICIPIO
                FMEDESCRIPCION
                FTMDESCRIPCION
                FCLDESCRIPCION
                PAGINA
                FNOTIRAJE
                AUTOR
                CAPTITULO
                CAPTEXTCOMP
                CAPDURACION
                CAPCM
                CAPFRACCION
                CAPCOSTOCM
                TEXNOMBRE
                QUENOMBRE
                TEVDESCRIPCION
                ACTOR
                VACPARTICIPACION
                CATEGORIA
                VACTENDENCIA
                VACFODA
                USRNOMBRE
                CAADIST8A12
                CAADIST13A17
                CAADIST18A24
                CAADIST25A34
                CAADIST35A44
                CAADIST45A54
                CAADIST55AMAS
                CAADISTALTO
                CAADISTMEDIO
                CAADISTBAJO
                CAADISTHOMBRE
                CAADISTMUJER
                CAAALCANCEREAL
                EJEDESCRIPCION
                EJEDESCRIPCIONH
                CAPNOMBRE
                VACSUBTEMAXML
                URL
                CIMNOMBREARCHIVO
                CAPTIPOCOSTO
                VACCLAVE
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

        if (!data.data || !data.data.getDataForTable) {
            return [];
        }

        return data.data.getDataForTable;
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        return [];
    }
};

// Generar las filas para la tabla
const generateValuationRows = (valuationInfo) => {
    const rows = [];

    valuationInfo.forEach(function (valuation) {
        let row = document.createElement("tr");
        Object.keys(valuation).forEach(function (key) {

            if (key === "VACCLAVE") return;

            let cell = document.createElement("td");
            let div = document.createElement("div");
            div.className = `table-cell ${key}`;
            div.setAttribute("data-name", key);

            if (key === "URL" || key === "CAPTITULO") {
                let link = document.createElement("a");
                link.href = valuation["URL"];
                link.textContent = valuation[key];
                link.target = "_blank";
                div.appendChild(link);
            } else {
                div.textContent = valuation[key];
            }

            cell.appendChild(div);
            row.appendChild(cell);
        });

        let deleteCell = document.createElement("td");
        let deleteDiv = document.createElement("div");
        deleteDiv.className = "table-cell";
        let deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-valution-btn";
        deleteBtn.dataset.vacclave = valuation["VACCLAVE"];
        deleteBtn.textContent = "Quitar registro";
        deleteDiv.appendChild(deleteBtn);
        deleteCell.appendChild(deleteDiv);
        row.appendChild(deleteCell);

        rows.push(row);
    });
    return rows;
};

const setupDeleteEvent = (date) => {
    document.querySelectorAll('.delete-valution-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const vacclave = btn.dataset.vacclave;
            if (!vacclave || vacclave === 'null' || vacclave === '') return;
            const confirmation = window.confirm("¿Estás seguro de quitar este registro?");
            if (!confirmation) return;
            try {
                showLoader();
                await deleteRecord(vacclave);
            } catch (error) {
                console.error('Error al eliminar el registro:', error);
            } finally {
                await setupValuationTable(date);
                hideLoader();
            }
        });
    });
};

const deleteRecord = async (vacclave) => {
    const graphqlMutation = `
        mutation deleteMention($id: ID!) {
            deleteMention(id: $id)  
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
                variables: { id: vacclave }
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.deleteMention) {
            throw new Error('No hay información en la respuesta.');
        }

        return data.data.deleteMention;
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        throw error;
    }
};

// Actualizar la tabla con las nuevas filas
const updateValuationTable = (valuationRows) => {
    let valuationTable = document.getElementById("valuation-info");
    let tbody = valuationTable.getElementsByTagName("tbody")[0];
    tbody.innerHTML = ""; // Vacía el contenido anterior
    valuationRows.forEach(row => {
        tbody.appendChild(row);
    });
};

// Inicializar Datatable con datos de valoración
const initializeValuationDataTable = () => {
    let exportByValuationTable = new DataTable('#valuation-info', {
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.0.3/i18n/es-ES.json',
        },
        lengthMenu: [5, 10, 25, 50, 100],
        pageLength: 5,
    });
};

// ------------------------------ Descarga de archivo ----------------------------------
const downloadButton = document.querySelector('.btn-download-excel');
if (downloadButton) {
    downloadButton.addEventListener('click', async () => {
        try {
            showLoader();
            const filePath = await generateExcel();
            await downloadExcel(filePath);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        } finally {
            hideLoader();
        }
    });
}

const generateExcel = async () => {
    let inputDate = document.getElementById('date');
    let selectedDate = inputDate?.value;

    const graphqlMutation = `
        mutation generateExcel(
            $fecha: String!
        ) {
            generateExcel(
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
                variables: { fecha: selectedDate }
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.generateExcel) {
            throw new Error('Error al descargar el archivo');
        }

        return data.data.generateExcel;
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        throw error;
    }
};

const downloadExcel = async (filePath) => {
    const userToken = getUserToken();
    try {
        const response = await fetch('/download-excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${userToken}`,
            },
            body: JSON.stringify({ filePath }),
        });
        if (!response.ok) {
            throw new Error('La respuesta no fue exitosa.');
        }

        const data = await response.blob();

        // Crear un enlace temporal y simular un clic para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'notas.xlsx');
        document.body.appendChild(link);
        link.click();

        // Limpiar el enlace temporal
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar el archivo:');
        throw error;
    }
};

// ------------------------------ Funcionalidad del loader ----------------------------------
const showLoader = () => {
    const loader = document.getElementById('loader');
    const valuationTable = document.getElementById('valuation-info');
    const dateContainer = document.getElementById('date-and-download-btn-container');
    dateContainer.style.display = 'none';
    valuationTable.style.display = 'none';
    loader.style.display = 'block';
};

const hideLoader = () => {
    const loader = document.getElementById('loader');
    const valuationTable = document.getElementById('valuation-info');
    const dateContainer = document.getElementById('date-and-download-btn-container');
    loader.style.display = 'none';
    valuationTable.style.display = 'block';
    dateContainer.style.display = 'flex';
};

// ----------------------------------------------------------------
const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

$(document).ready(function () {
    const currentDate = getCurrentDateFormatted();
    $('#date').val(currentDate);

    $('#date').datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: -105,
        maxDate: 0,
        onSelect: function (dateText) {
            setupValuationTable(dateText);
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const currentDate = getCurrentDateFormatted();
    setupValuationTable(currentDate);
});
