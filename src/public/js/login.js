document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const loginErrorElement = document.getElementById('login-error');
    
    const handleInputError = (input, errorElement) => {
        if (!input.value) {
            errorElement.textContent = 'Este campo es requerido*';
        } else {
            errorElement.textContent = '';
        }
    };
    
    const handleLogin = (username, password) => {
        const graphqlQuery = `
            query Login($username: String!, $password: String!) {
                login(username: $username, password: $password) {
                    id
                    email
                    username
                    rol
                    token
                }
            }
        `;

        fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: { username, password }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.login) {
                const user = data.data.login;
                // Guardar la cookie con el token de acceso
                document.cookie = `userToken=${user.token}; path=/`;
                // Redireccionar a la vista principal
                window.location.href = '/';
            } else {
                if (loginErrorElement) {
                    let errorMessage = data.errors[0]?.message;
                    if (errorMessage.startsWith("[controlled]")) {
                        errorMessage = errorMessage.slice("[controlled]".length);
                    }
                    errorMessage = errorMessage.trim();
                    loginErrorElement.textContent = errorMessage || 'Inicio de sesión fallido';
                }
            }
        })
        .catch(error => {
            console.error('Error al enviar la solicitud GraphQL', error);
            if (loginErrorElement) {
                loginErrorElement.textContent = 'Inicio de sesión fallido';
            }
        });
    };

    passwordToggle.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.src = '/images/icons/eye.svg';
        } else {
            passwordInput.type = 'password';
            passwordToggle.src = '/images/icons/eye-off.svg';
        }
    });

    usernameInput.addEventListener('input', function() {
        handleInputError(this, document.getElementById('username-error'));
    });

    passwordInput.addEventListener('input', function() {
        handleInputError(this, document.getElementById('password-error'));
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        loginErrorElement.textContent = "";


        handleInputError(usernameInput, document.getElementById('username-error'));
        handleInputError(passwordInput, document.getElementById('password-error'));

        if (usernameInput.value && passwordInput.value) {
            handleLogin(usernameInput.value, passwordInput.value);
        }
    });
});
