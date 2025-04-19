export class ElementManager{
    createElement({ id, tipo = 'texto', conteudo = 'Novo texto', left = 100, top = 100, width = 200, height = 60 }, socket) {
        const el = document.createElement('div');
        el.className = 'elemento';
        el.setAttribute('data-id', id);
        el.setAttribute('data-tipo', tipo);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        if (tipo === 'texto') {
            el.textContent = conteudo;
        } else if (tipo === 'imagem') {
            const img = document.createElement('img');
            img.src = conteudo;
            img.style.width = '100%';
            img.style.height = '100%';
            el.appendChild(img);
        } else if (tipo === 'video') {
            const video = document.createElement('video');
            video.src = conteudo;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            el.appendChild(video);
        }
        return el;
    }
    
        // Função para criar elementos (texto, imagem, vídeo)
    createEditableElemnt({ id, tipo = 'texto', conteudo = 'Novo texto', left = 100, top = 100, width = 200, height = 60 }, socket) {
        let isResizing = false; 
        const el = document.createElement('div');
        el.className = 'elemento';
        el.setAttribute('data-id', id);
        el.setAttribute('data-tipo', tipo);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete';
        deleteBtn.innerText = '×';
        deleteBtn.onclick = () => {
            el.remove();
            socket.emit('remover-elemento', { id });
        };
        el.appendChild(deleteBtn);

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

        if (tipo === 'texto') {
            const elTexto = this.createTextElemnt(conteudo);
            elTexto.addEventListener('dblclick', () => {
                const novoTexto = prompt('Novo texto:', conteudo);
                if (novoTexto !== null) {
                    elTexto.textContent = novoTexto;
                    socket.emit('editar-elemento', { id, conteudo: novoTexto });
                }
            });
            el.appendChild(elTexto);
        } else if (tipo === 'imagem') {
            const img = this.createImgElemnt(conteudo);
            el.appendChild(img);
        } else if (tipo === 'video') {
        const video = this.createVideoElemnt(conteudo);
        el.appendChild(video);
        }

        return el;
    }


    createTextElemnt= (conteudo) => {
        const elTexto = document.createElement('div');
        elTexto.className = 'texto';
        elTexto.textContent = conteudo;
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