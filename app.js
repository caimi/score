document.addEventListener('DOMContentLoaded', () => {
    // Estado
    let score1 = 0;
    let score2 = 0;
    let round1 = 0;
    let round2 = 0;
    const matchesHistory = [];
    const actionStack = [];

    // Timers
    let matchTime = 0;
    let roundTime = 0;
    let gameStarted = false;
    let interval = null;

    // Helpers de Tempo
    function pad(num) {
        return num.toString().padStart(2, '0');
    }

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function updateTimers() {
        matchTime++;
        roundTime++;

        document.getElementById('timer-total').innerText = `Total: ${formatTime(matchTime)}`;
        document.getElementById('timer-round').innerText = `Round: ${formatTime(roundTime)}`;
    }

    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            interval = setInterval(updateTimers, 1000);
        }
    }

    // Rounds
    function startNewRound(saveLog) {
        if (saveLog) {
            let p1Name = document.querySelector('.player-group:nth-child(1) .player-name').innerText.trim() || 'Player 1';
            let p2Name = document.querySelector('.player-group:nth-child(3) .player-name').innerText.trim() || 'Player 2';
            let winner = score1 > score2 ? p1Name : (score2 > score1 ? p2Name : 'Empate');

            matchesHistory.push({
                p1Name,
                p2Name,
                score1,
                score2,
                timeStr: formatTime(roundTime),
                winner
            });
        }

        score1 = 0;
        score2 = 0;
        document.getElementById('score-p1').innerText = '0';
        document.getElementById('score-p2').innerText = '0';

        document.getElementById('history-p1').innerHTML = '';
        document.getElementById('history-p2').innerHTML = '';

        // Reset apenas tempo do round
        roundTime = 0;
        document.getElementById('timer-round').innerText = `Round: 00:00:00`;
        actionStack.length = 0;
    }

    function undoLastAction() {
        const action = actionStack.pop();
        if (!action) return;

        if (action.targetPlayer === 1) {
            score1 -= action.value;
            document.getElementById('score-p1').innerText = score1;
        } else {
            score2 -= action.value;
            document.getElementById('score-p2').innerText = score2;
        }
        action.ballElement.remove();
    }

    // Handlers de Cliques nos Rounds
    document.getElementById('round-p1').addEventListener('click', () => {
        round1++;
        document.getElementById('round-p1').innerText = round1;
        startNewRound(true);
    });

    document.getElementById('round-p2').addEventListener('click', () => {
        round2++;
        document.getElementById('round-p2').innerText = round2;
        startNewRound(true);
    });

    // Elemento Histórico Visual
    function createHistoryBall(colorStr, isFoul) {
        const div = document.createElement('div');
        if (colorStr === 'strike-container') {
            div.className = 'strike-container';
            div.style.width = '32px';
            div.style.height = '32px';
            div.innerHTML = `
                <div class="ball ball-white" style="background: radial-gradient(circle at 35% 35%, #fff, #999); box-shadow: none; position: absolute; width: 100%; height: 100%"></div>
                <div class="strike-icon"></div>
            `;
        } else {
            div.className = `ball ${colorStr}`;
            // Se foi falta, desenha o icone de proibido (precisamos do position relative na ball)
            if (isFoul) {
                div.style.position = 'relative';
                div.innerHTML = `<div class="strike-icon"></div>`;
            }
        }
        return div;
    }

    // Área Central e Drag
    const balls = document.querySelectorAll('.center-divider [draggable="true"]');
    // Variáveis para Touch Drag
    let draggedBall = null;
    let ghostBall = null;
    let initialTouchX = 0;
    let initialTouchY = 0;

    balls.forEach(ball => {
        ball.addEventListener('dragstart', e => {
            const payload = {
                value: ball.dataset.value,
                color: ball.dataset.color,
                foul: ball.dataset.foul || "false"
            };
            e.dataTransfer.setData('text/plain', JSON.stringify(payload));
        });

        // Eventos Touch para Mobile Drag
        ball.addEventListener('touchstart', e => {
            e.preventDefault(); // Impede o scroll
            startGame(); // Garante o play no timer no 1o drop

            draggedBall = ball;
            initialTouchX = e.touches[0].clientX;
            initialTouchY = e.touches[0].clientY;

            // Criar e estilizar a bola fantasma
            ghostBall = ball.cloneNode(true); // Clonar a bola
            ghostBall.style.position = 'absolute';
            ghostBall.style.zIndex = '1000';
            ghostBall.style.opacity = '0.8';
            ghostBall.style.pointerEvents = 'none'; // Para que não interfira nos eventos debaixo
            ghostBall.style.width = ball.offsetWidth + 'px'; // Manter tamanho original
            ghostBall.style.height = ball.offsetHeight + 'px'; // Manter tamanho original

            // Posicionar o fantasma no local do toque
            ghostBall.style.left = (initialTouchX - ghostBall.offsetWidth / 2) + 'px';
            ghostBall.style.top = (initialTouchY - ghostBall.offsetHeight / 2) + 'px';

            document.body.appendChild(ghostBall);
        });
    });

    document.addEventListener('touchmove', e => {
        if (!draggedBall || !ghostBall) return;

        e.preventDefault(); // Impede o scroll durante o movimento

        const currentTouchX = e.touches[0].clientX;
        const currentTouchY = e.touches[0].clientY;

        // Atualiza a posição do fantasma
        ghostBall.style.left = (currentTouchX - ghostBall.offsetWidth / 2) + 'px';
        ghostBall.style.top = (currentTouchY - ghostBall.offsetHeight / 2) + 'px';
    });

    document.addEventListener('touchend', e => {
        if (!draggedBall || !ghostBall) return;

        document.body.removeChild(ghostBall);
        ghostBall = null;

        const touchX = e.changedTouches[0].clientX;
        const touchY = e.changedTouches[0].clientY;

        // Verificar onde a bola foi solta
        const targetElement = document.elementFromPoint(touchX, touchY);

        let dropped = false;
        dropAreas.forEach(area => {
            if (area.contains(targetElement)) {
                const payload = {
                    value: draggedBall.dataset.value,
                    color: draggedBall.dataset.color,
                    foul: draggedBall.dataset.foul || "false"
                };
                handleDrop(area.dataset.player, payload);
                dropped = true;
            }
        });

        draggedBall = null;
    });



    // Drop logic
    function handleDrop(dropPlayerStr, data) {
        const dropPlayer = parseInt(dropPlayerStr);
        let targetPlayer = dropPlayer;

        // Verifica checkbox de falta
        const foulCheckbox = document.querySelector('.foul-checkbox');
        const isFoul = data.foul === "true" || foulCheckbox.checked;

        // A regra de Snooker exige mínimo de 4 pontos em faltas ou o valor da bola (o que for maior)
        let value = parseInt(data.value);
        if (isFoul) {
            value = Math.max(4, value);
            targetPlayer = targetPlayer === 1 ? 2 : 1;

            // Depois de cometer e registrar falta, é útil descarregar o checkbox
            foulCheckbox.checked = false;
        }

        // Adicionar a pontuação
        if (targetPlayer === 1) {
            score1 += value;
            document.getElementById('score-p1').innerText = score1;
        } else {
            score2 += value;
            document.getElementById('score-p2').innerText = score2;
        }

        const ballElement = createHistoryBall(data.color, isFoul);
        ballElement.addEventListener('click', () => {
            const lastAction = actionStack[actionStack.length - 1];
            if (lastAction && lastAction.ballElement === ballElement) {
                undoLastAction();
            }
        });

        // Histórico fica no jogador original (onde a bola foi solta)
        if (dropPlayer === 1) {
            document.getElementById('history-p1').appendChild(ballElement);
        } else {
            document.getElementById('history-p2').appendChild(ballElement);
        }

        actionStack.push({
            targetPlayer,
            value,
            ballElement
        });
    }

    const dropAreas = [document.getElementById('area-p1'), document.getElementById('area-p2')];
    dropAreas.forEach(area => {
        area.addEventListener('dragover', e => {
            e.preventDefault(); // Permite drop
        });

        area.addEventListener('drop', e => {
            e.preventDefault();
            const dataStr = e.dataTransfer.getData('text/plain');
            if (!dataStr) return;
            try {
                const data = JSON.parse(dataStr);
                startGame(); // Garante o play no timer no 1o drop
                handleDrop(area.dataset.player, data);
            } catch (err) {
                console.error("Invalid drop payload", err);
            }
        });
    });

    // --- Modal e Menus ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const views = document.querySelectorAll('.modal-view');

    function showView(id) {
        views.forEach(v => v.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }

    // Toggle Principal Menu
    document.getElementById('menu-btn').addEventListener('click', () => {
        showView('view-main');
        modalOverlay.classList.remove('hidden');
    });

    modalClose.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            showView('view-main');
        });
    });

    document.getElementById('btn-help').addEventListener('click', () => showView('view-help'));
    document.getElementById('btn-about').addEventListener('click', () => showView('view-about'));

    // Geração de Histórico
    document.getElementById('btn-history').addEventListener('click', () => {
        const list = document.getElementById('history-list');
        list.innerHTML = ''; // Limpar antes de repovoar
        if (matchesHistory.length === 0) {
            list.innerHTML = '<p>Nenhum round foi computado ainda.</p>';
        } else {
            matchesHistory.forEach((h, index) => {
                list.innerHTML += `
                    <div class="history-item">
                        <strong>Round ${index + 1}</strong> | Duração: ${h.timeStr}<br>
                        ${h.p1Name} (${h.score1}) x (${h.score2}) ${h.p2Name}<br>
                        <em>Vencedor: ${h.winner}</em>
                    </div>
                `;
            });
        }
        showView('view-history');
    });

    // Reset Total C/ Safety Net
    document.getElementById('btn-restart').addEventListener('click', () => {
        if (confirm("Você está prester a DELETAR todos os dados desta partida, sem possibilidade de recuperação. Deseja reiniciar?")) {
            // Zera Vars
            score1 = 0; score2 = 0;
            round1 = 0; round2 = 0;
            matchesHistory.length = 0;
            actionStack.length = 0;
            matchTime = 0; roundTime = 0;
            gameStarted = false;
            clearInterval(interval);

            // Zera DOM numérico
            document.getElementById('score-p1').innerText = '0';
            document.getElementById('score-p2').innerText = '0';
            document.getElementById('round-p1').innerText = '0';
            document.getElementById('round-p2').innerText = '0';
            document.getElementById('timer-round').innerText = 'Round: 00:00:00';
            document.getElementById('timer-total').innerText = 'Total: 00:00:00';

            // Zera Nomes (como pedido)
            document.querySelector('.player-group:nth-child(1) .player-name').innerText = 'Player 1';
            document.querySelector('.player-group:nth-child(3) .player-name').innerText = 'Player 2';

            // Zera Histório Visual Inferior
            document.getElementById('history-p1').innerHTML = '';
            document.getElementById('history-p2').innerHTML = '';

            modalOverlay.classList.add('hidden');
        }
    });

    // --- Fullscreen Logic ---
    const fsBtn = document.getElementById('fullscreen-btn');
    const iconExpand = document.getElementById('icon-expand');
    const iconCompress = document.getElementById('icon-compress');

    function updateFsIcon() {
        if (document.fullscreenElement) {
            iconExpand.style.display = 'none';
            iconCompress.style.display = 'block';
        } else {
            iconExpand.style.display = 'block';
            iconCompress.style.display = 'none';
        }
    }

    fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error("Erro ao tentar Fullscreen:", err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    document.addEventListener('fullscreenchange', updateFsIcon);

    // Auto-fullscreen on mobile via first touch
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        const autoFs = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => { });
            }
            document.removeEventListener('touchstart', autoFs);
        };
        document.addEventListener('touchstart', autoFs, { once: true });
    }

    // Função para escalar o scoreboard para mobile
    function scaleScoreboardForMobile() {
        const scoreboard = document.querySelector('.scoreboard');
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobileDevice) {
            const board = document.querySelector('.scoreboard');
            const targetWidth = 1920;
            const targetHeight = 1080;

            /*const scaleX = window.innerWidth / targetWidth;
            const scaleY = window.innerHeight / targetHeight;*/

            let altura = document.documentElement.clientHeight;
            let largura = document.documentElement.clientWidth;
            const scaleX = largura / targetWidth;
            const scaleY = altura / targetHeight;
            console.log(scaleX, scaleY);
            // Se você quer que a altura seja SEMPRE prioridade:
            // const scale = scaleY; 

            // Mas o recomendado para não cortar as laterais em telas estreitas é:
            const scale = Math.min(scaleX, scaleY);

            // Mudamos para 'center' para trabalhar com o Flexbox do CSS
            board.style.transformOrigin = 'center center';
            board.style.transform = `scale(${scale})`;
            /*
            const viewportWidth = window.innerWidth;
            const originalWidth = 1920; // Largura original do scoreboard
            const scale = viewportWidth / originalWidth;

            scoreboard.style.transform = `scale(${scale})`;
            scoreboard.style.transformOrigin = 'top left'; // Escala a partir do canto superior esquerdo
            scoreboard.style.position = 'absolute'; // Garante que ele fique fixo no top left
            scoreboard.style.left = '0';
            scoreboard.style.top = '0';

            // Ajustar a altura do body para o scoreboard escalado
            const scaledHeight = 1080 * scale; // Altura original * escala
            document.body.style.minHeight = `${scaledHeight}px`;
            document.body.style.overflow = 'auto'; // Permitir rolagem se a altura for maior que a viewport*/
        } else {
            /*// Resetar estilos se não for mobile para o desktop ter o comportamento padrão
            scoreboard.style.transform = '';
            scoreboard.style.transformOrigin = '';
            // No desktop, centralizamos com CSS, então removemos o posicionamento fixo do JS
            scoreboard.style.position = 'absolute'; // Volta ao padrão do CSS para desktop
            scoreboard.style.left = '50%';
            scoreboard.style.top = '50%';
            scoreboard.style.transform = 'translate(-50%, -50%)'; // Centraliza via CSS
            document.body.style.minHeight = '100vh';
            document.body.style.overflow = 'hidden';*/
            const board = document.querySelector('.scoreboard');
            const targetWidth = 1920;
            const targetHeight = 1080;

            const scaleX = window.innerWidth / targetWidth;
            const scaleY = window.innerHeight / targetHeight;
            console.log(scaleX, scaleY);
            // Se você quer que a altura seja SEMPRE prioridade:
            // const scale = scaleY; 

            // Mas o recomendado para não cortar as laterais em telas estreitas é:
            const scale = Math.min(scaleX, scaleY);

            // Mudamos para 'center' para trabalhar com o Flexbox do CSS
            board.style.transformOrigin = 'center center';
            board.style.transform = `scale(${scale})`;
        }
    }

    window.addEventListener('resize', scaleScoreboardForMobile);
   window.addEventListener('load', scaleScoreboardForMobile);
});
