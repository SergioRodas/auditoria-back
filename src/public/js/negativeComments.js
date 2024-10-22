const editableFields = ["auditoria_mencion", "autor", "programa","programGroup"];

// Configuración inicial
const setupNegativeCommentsTable = async (date) => {
    // Mostrar loader
    showLoader();

    try {
        await buildNegativeCommentsTable(date);
    } catch (error) {
        console.error('Error al cargar los comentarios negativos:', error);
    } finally {
        // Ocultar loader después de que se complete la carga
        hideLoader();
    }
};

// Construir la tabla de comentarios negativos
const buildNegativeCommentsTable = async (date) => {
    try {
        const negativeCommentsOnRadio = await fetchNegativeComments(date, "Radio");
        const negativeCommentsOnTV = await fetchNegativeComments(date, "Televisión");

        const radioRows = generateNegativeCommentsRows(negativeCommentsOnRadio, 'RADIO');
        const tvRows = generateNegativeCommentsRows(negativeCommentsOnTV, 'TELEVISIÓN');
        const allMediumRows = [...radioRows, ...tvRows];
        if ($.fn.DataTable.isDataTable('#negative-comments')) {
            $('#negative-comments').DataTable().destroy();
        }
        updateNegativeCommentsTable(allMediumRows);
        initializeNegativeCommentsDataTable();
        setupNegativeCommentsEvents(date);
    } catch (error) {
        console.error('Error al construir la tabla:', error);
    }
}

// Obtiene el token desde las cookies
const getUserToken = () => {
    const userToken = document.cookie.split('; ')
        .find(row => row.startsWith('userToken='))
        .split('=')[1];
    return userToken;
};

// Obtener los comentarios negativos,
const fetchNegativeComments = async (date, medium) => {
    const graphqlQuery = `
        query getNegativeMentionsForAdmin($date: String!, $medium: String!) {
            getNegativeMentionsForAdmin(fecha: $date, tipoMedio: $medium) {
                fecha
                capclave
                autor
                programa
                programGroup
                testigo
                captexcomp
                auditoria_id
                auditoria_mencion
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
                variables: { date, medium }
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.getNegativeMentionsForAdmin) {
            return [];
        }

        return data.data.getNegativeMentionsForAdmin;
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        return [];
    }
};

// Generar las filas
const generateNegativeCommentsRows = (commentsData, medium) => {
    const rows = [];
    commentsData.forEach(function (comment) {
        let row = document.createElement("tr");
        // Celda de "medio"
        let mediumCell = document.createElement("td");
        let mediumDiv = document.createElement("div");
        mediumDiv.textContent = medium;
        mediumDiv.className = "table-cell";
        mediumDiv.setAttribute("data-name", "medio");
        mediumCell.appendChild(mediumDiv);
        row.appendChild(mediumCell);
        // Resto de celdas
        Object.keys(comment).forEach(function (key) {
            if (key === 'auditoria_id') {
                row.dataset.auditoriaId = comment[key];
            } else {
                let cell = document.createElement("td");
                let div = document.createElement("div");
                div.className = `table-cell ${key}`;
                div.setAttribute("data-name", key);

                if (key === 'testigo') {
                    let link = document.createElement("a");
                    link.href = comment.testigo;
                    link.textContent = "Testigo";
                    link.target = "_blank";
                    div.appendChild(link);
                } else if (editableFields.includes(key)) {
                    div.setAttribute('contenteditable', 'true');
                    div.setAttribute("data-original-content", comment[key]);
                    div.textContent = comment[key];
                } else {
                    div.textContent = comment[key];
                }
                cell.appendChild(div);
                row.appendChild(cell);
            }
        });

        // Celda de "Si/No"
        let publishedCell = document.createElement("td");
        let publishedDiv = document.createElement("div");
        publishedDiv.className = "table-cell";
        let isPublished = (comment.auditoria_id && comment.auditoria_id !== "");
        publishedDiv.textContent = (isPublished && comment.auditoria_mencion && comment.auditoria_mencion !== "") ? "Sí" : "No";
        publishedCell.appendChild(publishedDiv);
        row.appendChild(publishedCell);

        // Celda de acciones
        let actionsCell = document.createElement("td");
        let actionsDiv = document.createElement("div");
        actionsDiv.className = "table-cell";
        let saveBtn = document.createElement("button");
        saveBtn.className = "save-btn";
        saveBtn.textContent = "Guardar";
        saveBtn.disabled = true;
        let deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.disabled = !isPublished;
        deleteBtn.textContent = "Remover";
        actionsDiv.appendChild(saveBtn);
        actionsDiv.appendChild(deleteBtn);
        actionsCell.appendChild(actionsDiv);
        row.appendChild(actionsCell);
        rows.push(row);
    });
    return rows;
};

// Actualiza la tabla
const updateNegativeCommentsTable = (rows) => {
    let commentsTable = document.getElementById("negative-comments");
    let tbody = commentsTable.getElementsByTagName("tbody")[0];
    tbody.innerHTML = ""; // Vacía el contenido anterior
    rows.forEach(row => {
        tbody.appendChild(row);
    });
};

// Inicializar Datatable de comentarios negativos
const initializeNegativeCommentsDataTable = () => {
    let negativeCommentsTable = new DataTable('#negative-comments', {
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.0.3/i18n/es-ES.json',
        },
        lengthMenu: [5, 10, 25, 50, 100],
        pageLength: 5,
    });
};

// Configura los eventos del DOM para la tabla de comentarios negativos
const setupNegativeCommentsEvents = (date) => {
    // Activar el botón de guardar
    document.querySelectorAll('.table-cell[contenteditable="true"]').forEach(input => {
        input.addEventListener('input', () => {
            let row = input.parentElement.parentElement;
            const saveBtn = row.querySelector('.save-btn');
            const isSaveDisabled = isSaveButtonDisabled(row);
            saveBtn.disabled = isSaveDisabled;
        });
    });

    // Guardar los nuevos valores
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            let negativeCommentData = prepareNegativeCommentData(btn);
            try {
                showLoader();
                if (negativeCommentData.mencion.trim() !== "") {
                    await saveNegativeComment(negativeCommentData);
                } else if (negativeCommentData.id) {
                    await deleteNegativeComment(negativeCommentData.id);
                }
            } catch (error) {
                console.error('Error al guardar el comentario negativo:', error);
            } finally {
                await buildNegativeCommentsTable(date);
                hideLoader();
            }
            btn.disabled = true;
        });
    });

    // Eliminar mención
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const row = btn.parentElement.parentElement.parentElement;
            const auditoriaId = row.dataset.auditoriaId;
            if (!auditoriaId || auditoriaId === 'null' || auditoriaId === '') return;
            try {
                showLoader();
                await deleteNegativeComment(auditoriaId);
            } catch (error) {
                console.error('Error al eliminar el comentario negativo:', error);
            } finally {
                await buildNegativeCommentsTable(date);
                hideLoader();
            }
        });
    });
};

const isSaveButtonDisabled = (row) => {
    let haveChanges = false;
    let anyFieldEmpty = false;
    let mentionIsEmpty = true;
    let isPublished = row.dataset.auditoriaId && row.dataset.auditoriaId !== "null";
    for (let field of editableFields) {
        let element = row.querySelector(`.${field}`);
        let originalContent = element.dataset.originalContent;
        let content = element.innerText.trim();

        if (content !== originalContent) {
            haveChanges = true;
        }

        if (field === "auditoria_mencion"){
            if (content !== "") mentionIsEmpty = false;
        } else {
            if (content === "") anyFieldEmpty = true;
        }
    }

    return (!haveChanges || anyFieldEmpty || (!isPublished && mentionIsEmpty));
};

// Funcionalidad del loader
const showLoader = () => {
    const loader = document.getElementById('loader');
    const commentsTable = document.getElementById('negative-comments');
    const dateContainer = document.getElementById('date-container');
    dateContainer.style.display = 'none';
    commentsTable.style.display = 'none';
    loader.style.display = 'block';
};

const hideLoader = () => {
    const loader = document.getElementById('loader');
    const commentsTable = document.getElementById('negative-comments');
    const dateContainer = document.getElementById('date-container');
    loader.style.display = 'none';
    commentsTable.style.display = 'block';
    dateContainer.style.display = 'flex';
};

// Armar la estructura del comentario
const prepareNegativeCommentData = (btn) => {
    const row = btn.parentElement.parentElement.parentElement;
    const id = row.dataset.auditoriaId && row.dataset.auditoriaId !== 'null' ?
        row.dataset.auditoriaId : '';
    const capsula = row.querySelector('[data-name="capclave"]').innerText;
    const tipoMedio = row.querySelector('[data-name="medio"]').innerText;
    const cadena = row.querySelector('[data-name="programGroup"]').innerText;
    const programa = row.querySelector('[data-name="programa"]').innerText;
    const autor = row.querySelector('[data-name="autor"]').innerText;
    const mencion = row.querySelector('[data-name="auditoria_mencion"]').innerText;
    const fecha = row.querySelector('[data-name="fecha"]').innerText;

    const commentData = {
        id,
        capsula,
        tipoMedio,
        cadena,
        programa,
        autor,
        mencion,
        fecha,
    };

    return commentData;
};

// Guardar el comentario
const saveNegativeComment = async (commentData) => {
    const graphqlMutation = `
        mutation createOrUpdateMentionNegative(
            $id: ID,
            $capsula: String!,
            $tipoMedio: String!,
            $cadena: String!,
            $programa: String!,
            $autor: String!,
            $mencion: String!
            $fecha: String!
        ) {
            createOrUpdateMentionNegative(
                id: $id,
                capsula: $capsula,
                tipoMedio: $tipoMedio,
                cadena: $cadena,
                programa: $programa,
                autor: $autor,
                mencion: $mencion
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
                variables: commentData
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.createOrUpdateMentionNegative) {
            throw new Error('Error al guardar el comentario negativo');
        }

        return data.data.createOrUpdateMentionNegative;
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        throw error;
    }
};

// Eliminar la mención negativa y quitar el comentario
const deleteNegativeComment = async (id) => {
    const graphqlMutation = `
        mutation DeleteNegativeComment($id: ID!) {
            deleteMentionNegative(id: $id)  
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
                variables: { id }
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar la solicitud GraphQL');
        }

        const data = await response.json();

        if (!data.data || !data.data.deleteMentionNegative) {
            throw new Error('Error al eliminar el comentario negativo');
        }
    } catch (error) {
        console.error('Error al enviar la solicitud GraphQL', error);
        throw error;
    }
};

// ----------------------------------------------------------------
const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const onDateChange = async (selectedDate) => {
    showLoader();
    try {
        await buildNegativeCommentsTable(selectedDate);
    } catch (error) {
        console.error('Error al cargar los comentarios negativos con una nueva fecha:', error);
    } finally {
        hideLoader();
    }
};

$(document).ready(function () {
    const currentDate = getCurrentDateFormatted();
    $('#date').val(currentDate);

    $('#date').datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: -105,
        maxDate: 0,
        onSelect: function (dateText) {
            onDateChange(dateText);
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const currentDate = getCurrentDateFormatted();
    setupNegativeCommentsTable(currentDate);
});
