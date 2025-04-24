export class ElementManager{
    createElement({ id, type = 'texto', content = 'Novo texto', left = 100, top = 100, width = 200, height = 60 }, socket) {
        const el = document.createElement('div');
        el.className = 'elemento';
        el.setAttribute('data-id', id);
        el.setAttribute('data-type', type);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        if (type === 'texto') {
            el.textContent = content;
            el.id = 'textoDiv';
        } else if (type === 'imagem') {
            const img = document.createElement('img');
            img.src = content;
            img.style.width = '100%';
            img.style.height = '100%';
            el.appendChild(img);
        } else if (type === 'video') {
            const video = this.createVideoElement(content, true);
            el.appendChild(video);
            }
        return el;
    }
    
        // Função para criar elementos (texto, imagem, vídeo)
    createEditableElemnt({ id, type = 'texto', content = 'Novo texto', left = 100, top = 100, width = 200, height = 60 }, socket) {
        let isResizing = false; 
        const el = document.createElement('div');
        el.className = 'elemento';
        el.setAttribute('data-id', id);
        el.setAttribute('data-type', type);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        //delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete';
        deleteBtn.innerText = '×';
        deleteBtn.onclick = () => {
            el.remove();
            socket.emit('remover-elemento', { id });
        };
        el.appendChild(deleteBtn);
        
        
        const toggleVisibilityBtn = this.createVisibilityButton(el, socket, id);
        el._toggleVisibilityBtn = toggleVisibilityBtn;
        el.appendChild(toggleVisibilityBtn);


        // Resizer for resizing functionality
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        el.appendChild(resizer);

        // Moving functionality
        el.onmousedown = (e) => {
        if(isResizing) return; 
        e.preventDefault();
        const offsetX = e.clientX - el.getBoundingClientRect().left;
        const offsetY = e.clientY - el.getBoundingClientRect().top;
        const moveElement = (moveEvent) => {
            el.style.left = `${moveEvent.clientX - offsetX}px`;
            el.style.top = `${moveEvent.clientY - offsetY}px`;
            socket.emit('mover-elemento', {
            id,
            left: parseInt(el.style.left, 10),
            top: parseInt(el.style.top, 10),
            });
        };

        const stopMove = () => {
            document.removeEventListener('mousemove', moveElement);
            document.removeEventListener('mouseup', stopMove);
        };
        document.addEventListener('mousemove', moveElement);
        document.addEventListener('mouseup', stopMove);
        };


        // Resizing functionality
        resizer.onmousedown = (e) => {
        isResizing = true;
        e.preventDefault();
        const initialWidth = parseInt(el.style.width, 10);
        const initialHeight = parseInt(el.style.height, 10);
        const initialX = e.clientX;
        const initialY = e.clientY;

        // Lock the initial position of the element
        const initialLeft = parseInt(el.style.left, 10);
        const initialTop = parseInt(el.style.top, 10);

        const resizeElement = (resizeEvent) => {
        const width = initialWidth + (resizeEvent.clientX - initialX);
        const height = initialHeight + (resizeEvent.clientY - initialY);
        if (width > 100) el.style.width = `${width}px`;
        if (height > 40) el.style.height = `${height}px`;

        // Keep the position locked
        el.style.left = `${initialLeft}px`;
        el.style.top = `${initialTop}px`;

        socket.emit('redimensionar-elemento', {
            id,
            width: parseInt(el.style.width, 10),
            height: parseInt(el.style.height, 10),
        });
        };

        const stopResize = () => {
        document.removeEventListener('mousemove', resizeElement);
        document.removeEventListener('mouseup', stopResize);
        isResizing = false;
        };
        document.addEventListener('mousemove', resizeElement);
        document.addEventListener('mouseup', stopResize);
        };

        if (type === 'texto') {
            const elTexto = this.createTextElemnt(content);
            const editor = this.createTextEditor();
            editor.style.display = 'none';
            document.body.appendChild(editor);
        
            elTexto.addEventListener('dblclick', () => {
                const input = editor.querySelector('input[type="text"]');
                const colorInput = editor.querySelector('input[type="color"]');
                const fontSelect = editor.querySelector('select');
                const sizeInput = editor.querySelector('input[type="number"]');
        
                input.value = elTexto.textContent;
                colorInput.value = elTexto.style.color || '#000000';
                fontSelect.value = elTexto.style.fontFamily || 'Arial';
                sizeInput.value = parseInt(elTexto.style.fontSize) || 16;
        
                editor.style.display = 'block';
        
                const rect = elTexto.getBoundingClientRect();
                editor.style.top = `${rect.top + window.scrollY + 20}px`;
                editor.style.left = `${rect.left + window.scrollX}px`;
        
                const saveBtn = editor.querySelector('button');
                saveBtn.onclick = () => {
                    const novoTexto = input.value;
                    const novaCor = colorInput.value;
                    const novaFonte = fontSelect.value;
                    const novoSize = `${sizeInput.value}px`;
        
                    elTexto.textContent = novoTexto;
                    elTexto.style.color = novaCor;
                    elTexto.style.fontFamily = novaFonte;
                    elTexto.style.fontSize = novoSize;
        
                    editor.style.display = 'none';
        
                    socket.emit('editar-elemento', {
                        id,
                        content: novoTexto,
                        color: novaCor,
                        font: novaFonte,
                        size: novoSize,
                    });
                };
            });
        
            el.appendChild(elTexto);
        } else if (type === 'imagem') {
            const img = this.createImgElemnt(content);
            el.appendChild(img);
        } else if (type === 'video') {
        const video = this.createVideoElement(content);
        el.appendChild(video);
        }

        return el;
    }


    createTextElemnt= (content) => {
        const elTexto = document.createElement('div');
        elTexto.id = "textoDiv"
        elTexto.className = 'texto';
        elTexto.textContent = content;
        elTexto.style.width = '100%';
        elTexto.style.height = '100%';
        elTexto.style.overflow = 'hidden';
        elTexto.style.textOverflow = 'ellipsis';
        elTexto.style.whiteSpace = 'nowrap';
        elTexto.style.cursor = 'text';
        return elTexto;
    }

    createImgElemnt = (url) => {
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100%';
        img.style.height = '100%';
        return img;
    }

    createVideoElement = (url, autoplay = false) => {
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        
        if (isYouTube) {
            // Extrai o ID do vídeo
            let videoId;
            const youtubeRegex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
            const match = url.match(youtubeRegex);
            if (match && match[1]) {
                videoId = match[1];
            } else {
                console.error("URL do YouTube inválida.");
                return null;
            }

            // Cria o iframe
            const iframe = document.createElement('iframe');
            iframe.id = `yt-player-${videoId}`;

            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=1&muted=1`;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            return iframe;
        } else {
            // Assume que é um arquivo de vídeo direto
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            return video;
        }
    }


    createEraser = () =>{
        // Cria o elemento da "bola" do apagador
        const apagadorVisual = document.createElement('div');
        apagadorVisual.style.position = 'fixed';
        apagadorVisual.style.width = '20px'; // Tamanho da área de apagar
        apagadorVisual.style.height = '20px';
        apagadorVisual.style.borderRadius = '50%';
        apagadorVisual.style.border = '2px solid red'; // Pode mudar a cor
        apagadorVisual.style.pointerEvents = 'none'; // Não interfere nos cliques
        apagadorVisual.style.zIndex = '9999';
        apagadorVisual.style.display = 'none'; // Começa invisível
        return apagadorVisual;
    }

    createTextEditor = () => {
        const editor = document.createElement('div');
        editor.style.position = 'absolute';
        editor.style.height = 'auto';
        editor.style.width = '300px';
        editor.style.backgroundColor = 'lightgray';
        editor.style.top = '40%';
        editor.style.left = '40%';
        editor.style.padding = '10px';
        editor.style.display = 'flex';
        editor.style.flexDirection = 'column';
        editor.style.gap = '10px';
        editor.style.zIndex = '999';
    
        // Campo de texto
        const editText = document.createElement('input');
        editText.type = 'text';
        editText.placeholder = 'Escreva o novo texto';
    
        // Dropdown de fontes
        const editFont = document.createElement('select');
        const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            editFont.appendChild(option);
        });
    
        // Tamanho da fonte
        const editSize = document.createElement('input');
        editSize.type = 'number';
        editSize.placeholder = 'Tamanho da fonte (px)';
        editSize.min = 8;
        editSize.max = 100;
    
        // Picker de cor
        const editColor = document.createElement('input');
        editColor.type = 'color';
    
        // Botão de salvar
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar';
    
        // Adiciona tudo ao editor
        editor.appendChild(editText);
        editor.appendChild(editFont);
        editor.appendChild(editSize);
        editor.appendChild(editColor);
        editor.appendChild(saveBtn);
    
        return editor;
    };
    
    createVisibilityButton (el, socket, id){
        // Hide button
        const toggleVisibilityBtn = document.createElement('button');
        toggleVisibilityBtn.className = 'hide';
        toggleVisibilityBtn.innerText = '👁';
        let ocultoParaOutros = false;

        toggleVisibilityBtn.onclick = () => {
            ocultoParaOutros = !ocultoParaOutros;

            if (ocultoParaOutros) {
                el.classList.add('hided');
                el.style.opacity = '0.5';
                toggleVisibilityBtn.innerText = '🚫';
                socket.emit('ocultar-elemento', { id });
            } else {
                el.classList.remove('hided');
                el.style.opacity = '1';
                toggleVisibilityBtn.innerText = '👁';
                socket.emit('mostrar-elemento', { id });
            }
        };
        return toggleVisibilityBtn;
    }
}