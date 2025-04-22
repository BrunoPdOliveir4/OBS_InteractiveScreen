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
            el.appendChild(elTexto);
        } else if (type === 'imagem') {
            const img = document.createElement('img');
            img.src = content;
            img.style.width = '100%';
            img.style.height = '100%';
            el.appendChild(img);
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.src = content;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
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
            elTexto.addEventListener('dblclick', () => {
                const novoTexto = prompt('Novo texto:', content);
                if (novoTexto !== null) {
                    elTexto.textContent = novoTexto;
                    socket.emit('editar-elemento', { id, content: novoTexto, 
                                                    color: elTexto.style.color, 
                                                    size: elTexto.style.fontSize});
                }
            });
            el.appendChild(elTexto);
        } else if (type === 'imagem') {
            const img = this.createImgElemnt(content);
            el.appendChild(img);
        } else if (type === 'video') {
        const video = this.createVideoElemnt(content);
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

    createVideoElemnt = (url) => {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.width = '100%';
        video.style.height = '100%';
        return video;
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
}