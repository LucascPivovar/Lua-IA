document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            document.getElementById('register-modal').style.display = 'none';
        } else {
            alert(data.message || 'Erro ao registrar usuário.');
        }
    } catch (error) {
        alert('Erro ao tentar registrar usuário. Tente novamente mais tarde.');
        console.error('Erro no registro:', error);
    }
});
