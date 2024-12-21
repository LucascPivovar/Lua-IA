document.getElementById('generate-btn').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt')?.value;
    const style = document.getElementById('style')?.value;
    const imageContainer = document.getElementById('image-container');
    const saveButton = document.getElementById('save-btn');
    const removeButton = document.getElementById('remove-btn');
    const loginModal = document.getElementById('login-modal');

    if (!prompt || !style) {
        alert('Por favor, preencha o prompt e selecione um estilo.');
        return;
    }

    try {
        // Verifica a sessão do usuário no backend
        const sessionCheck = await fetch('/check-session');
        const sessionData = await sessionCheck.json();

        if (!sessionData.loggedIn) {
            alert('Você precisa fazer login para gerar uma imagem.');
            loginModal.style.display = 'block'; // Mostra o modal de login
            return;
        }

        // Exibe o GIF de carregamento
        imageContainer.innerHTML = `
            <div style="text-align: center;">
                <img src="./assets/loader.gif" alt="Carregando..." style="max-width: 100px;">
                <p>Gerando imagem, aguarde...</p>
            </div>
        `;

        // Oculta os botões enquanto carrega
        saveButton.style.display = 'none';
        removeButton.style.display = 'none';

        // Envia os dados para a API de geração
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, style }),
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar imagem no servidor.');
        }

        const data = await response.json();

        if (data.imageUrl) {
            // Exibe a imagem gerada
            imageContainer.innerHTML = `
                <img src="${data.imageUrl}" alt="Imagem gerada" style="max-width: 100%; border-radius: 10px;" />
            `;

            // Mostra os botões "Salvar" e "Criar Novamente"
            saveButton.style.display = 'inline-block';
            removeButton.style.display = 'inline-block';

            // Configura o botão de salvar
            saveButton.onclick = () => {
                const link = document.createElement('a');
                link.href = data.imageUrl;
                link.download = `imagem-gerada-${Date.now()}.jpg`;
                link.click();
            };

            // Configura o botão de criar novamente
            removeButton.onclick = () => {
                imageContainer.innerHTML = ''; // Limpa a imagem
                saveButton.style.display = 'none'; // Oculta botão salvar
                removeButton.style.display = 'none'; // Oculta botão criar novamente
            };
        } else {
            throw new Error('A API não retornou uma imagem válida.');
        }
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        alert('Ocorreu um erro ao tentar gerar a imagem. Por favor, tente novamente.');
        imageContainer.innerHTML = ''; // Limpa o contêiner
    }
});
