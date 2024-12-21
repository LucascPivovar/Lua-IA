document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const loginModal = document.getElementById('login-modal');

    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Erro ao autenticar. Verifique suas credenciais.');
        }

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            loginModal.style.display = 'none'; // Fecha o modal
            localStorage.setItem('loggedIn', 'true'); // Armazena o estado de login no localStorage
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Erro ao fazer login. Tente novamente.');
        console.error('Erro no login:', error);
    }
});
