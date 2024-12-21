
        // Modal Login
        const loginBtn = document.getElementById('login-btn');
        const loginModal = document.getElementById('login-modal');
        const closeLogin = document.getElementById('close-login');
        const openRegister = document.getElementById('open-register');

        // Modal Cadastro
        const registerModal = document.getElementById('register-modal');
        const closeRegister = document.getElementById('close-register');

        // Abrir modal de login
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });

        // Fechar modal de login
        closeLogin.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });

        // Abrir modal de cadastro
        openRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });

        // Fechar modal de cadastro
        closeRegister.addEventListener('click', () => {
            registerModal.style.display = 'none';
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === registerModal) {
                registerModal.style.display = 'none';
            }
        });