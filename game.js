// Warrior's Quest: O Desafio do Dragão Dourado
// Sistema de jogo completo

class WarriorsQuest {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.gameState = 'menu';
        this.board = this.initializeBoard();
        this.monsterDeck = this.initializeMonsterDeck();
        this.eventDeck = this.initializeEventDeck();
        this.dragonsDefeated = [];
        this.combatState = null;
        
        this.initializeEventListeners();
    }

    // Inicialização do tabuleiro
    initializeBoard() {
        const board = [];
        const cellTypes = [
            { type: 'common', emoji: '🟢', weight: 35 },
            { type: 'treasure', emoji: '💰', weight: 15 },
            { type: 'luck', emoji: '🃏', weight: 10 },
            { type: 'monster', emoji: '👹', weight: 20 },
            { type: 'village', emoji: '⛺', weight: 12 },
            { type: 'event', emoji: '❓', weight: 8 }
        ];

        // Casa inicial
        board.push({ type: 'common', emoji: '🏠', position: 0 });

        // Casas 1-59
        for (let i = 1; i < 60; i++) {
            const rand = Math.random() * 100;
            let cumulative = 0;
            let selectedType = cellTypes[0];

            for (const cellType of cellTypes) {
                cumulative += cellType.weight;
                if (rand <= cumulative) {
                    selectedType = cellType;
                    break;
                }
            }

            board.push({
                type: selectedType.type,
                emoji: selectedType.emoji,
                position: i
            });
        }

        // Casa final - Toca do Dragão
        board.push({ type: 'dragon', emoji: '🐉', position: 60 });

        return board;
    }

    // Inicialização do baralho de monstros
    initializeMonsterDeck() {
        const monsters = [
            {
                name: 'Goblin Batedor',
                hp: 6,
                maxHp: 6,
                attack: { name: 'Clavada Súbita', damage: 2, type: 'quick' },
                reward: { gold: 8 }
            },
            {
                name: 'Orc Guerreiro',
                hp: 12,
                maxHp: 12,
                attack: { name: 'Machado Pesado', damage: 4, type: 'heavy' },
                reward: { gold: 15, drawCard: true }
            },
            {
                name: 'Lobo das Sombras',
                hp: 8,
                maxHp: 8,
                attack: { name: 'Mordida Veloz', damage: 3, type: 'quick', special: 'discard' },
                reward: { gold: 12 }
            }
        ];

        // Criar múltiplas cópias de cada monstro
        const deck = [];
        monsters.forEach(monster => {
            for (let i = 0; i < 6; i++) {
                deck.push({ ...monster, hp: monster.maxHp });
            }
        });

        return this.shuffleDeck(deck);
    }

    // Inicialização do baralho de eventos
    initializeEventDeck() {
        const events = [
            {
                title: 'Comerciante Perdido',
                description: 'Um comerciante oferece seus serviços. Você pode comprar uma poção de cura por 10 moedas.',
                type: 'choice',
                options: [
                    { text: 'Comprar (10 ouro)', cost: 10, effect: 'heal', value: 8 },
                    { text: 'Recusar', effect: 'none' }
                ]
            },
            {
                title: 'Armadilha Antiga',
                description: 'Você pisa em uma armadilha! Perde 3 PV.',
                type: 'damage',
                damage: 3
            },
            {
                title: 'Fonte Mágica',
                description: 'Uma fonte cristalina restaura suas energias!',
                type: 'heal',
                healing: 6
            },
            {
                title: 'Ladino Esperto',
                description: 'Um ladino tenta roubar suas moedas!',
                type: 'goldLoss',
                amount: 0.25 // 25% do ouro
            },
            {
                title: 'Mentor Sábio',
                description: 'Um velho sábio lhe ensina técnicas de combate.',
                type: 'drawCards',
                amount: 2
            },
            {
                title: 'Tesouro Escondido',
                description: 'Você encontra um baú enterrado!',
                type: 'gold',
                amount: 20
            }
        ];

        const deck = [];
        events.forEach(event => {
            for (let i = 0; i < 3; i++) {
                deck.push({ ...event });
            }
        });

        return this.shuffleDeck(deck);
    }

    // Inicialização do baralho do herói
    initializeHeroDeck() {
        return [
            // Cartas de Ataque
            { name: 'Ataque Rápido', type: 'attack', damage: 3, category: 'attack' },
            { name: 'Ataque Rápido', type: 'attack', damage: 3, category: 'attack' },
            { name: 'Ataque Rápido', type: 'attack', damage: 3, category: 'attack' },
            { name: 'Ataque Rápido', type: 'attack', damage: 3, category: 'attack' },
            
            { name: 'Ataque Forte', type: 'attack', damage: 5, category: 'attack' },
            { name: 'Ataque Forte', type: 'attack', damage: 5, category: 'attack' },
            { name: 'Ataque Forte', type: 'attack', damage: 5, category: 'attack' },
            
            { name: 'Golpe Perfurante', type: 'attack', damage: 2, piercing: true, category: 'attack' },
            { name: 'Golpe Perfurante', type: 'attack', damage: 2, piercing: true, category: 'attack' },
            
            // Cartas de Defesa
            { name: 'Defesa Simples', type: 'defense', block: 3, category: 'defense' },
            { name: 'Defesa Simples', type: 'defense', block: 3, category: 'defense' },
            { name: 'Defesa Simples', type: 'defense', block: 3, category: 'defense' },
            
            { name: 'Escudo Barricada', type: 'defense', block: 6, category: 'defense' },
            
            // Cartas de Esquiva
            { name: 'Esquiva Ágil', type: 'dodge', dodgeType: 'quick', category: 'dodge' },
            { name: 'Esquiva Ágil', type: 'dodge', dodgeType: 'quick', category: 'dodge' },
            
            { name: 'Antecipação', type: 'dodge', dodgeType: 'heavy', reward: 'drawCard', category: 'dodge' },
            
            // Cartas Táticas (Especiais)
            { name: 'Poção de Cura', type: 'heal', healing: 8, category: 'special' },
            { name: 'Contra-Ataque', type: 'counter', block: 4, counterDamage: 2, category: 'special' },
            { name: 'Fôlego Renovado', type: 'refresh', discardMax: 3, category: 'special' }
        ];
    }

    // Utilitários
    shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    initializeEventListeners() {
    }

    // Inicialização do jogo
    startGame() {
        try {
            // Verificar se os elementos existem
            const playerCountElement = document.getElementById('playerCount');
            if (!playerCountElement) {
                console.error('Elemento playerCount não encontrado');
                console.log('Erro: Elementos da interface não encontrados. Recarregue a página.');
                return;
            }

            // Obter configurações dos jogadores
            const playerCount = parseInt(playerCountElement.value);
            this.players = [];

            for (let i = 0; i < playerCount; i++) {
                const nameInput = document.getElementById(`player${i}Name`);
                const colorInput = document.querySelector(`input[name="player${i}Color"]`);
                
                const player = {
                    id: i,
                    name: nameInput && nameInput.value ? nameInput.value : `Herói ${i + 1}`,
                    color: colorInput && colorInput.value ? colorInput.value : ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][i],
                    position: 0,
                    hp: 20,
                    maxHp: 20,
                    gold: 15,
                    deck: this.shuffleDeck(this.initializeHeroDeck()),
                    hand: [],
                    discardPile: [],
                    handLimit: 5,
                    extraHandUntilEndOfTurn: false,
                    dragonAttempts: 0,
                    hasRolledThisTurn: false
                };

                // Puxar 5 cartas iniciais
                for (let j = 0; j < 5; j++) {
                    this.puxarCarta(player);
                }

                this.players.push(player);
            }

            this.currentPlayerIndex = 0;
            this.round = 1;
            this.gameState = 'playing';
            this.dragonsDefeated = [];

            console.log('Jogo iniciado com sucesso!', this.players);
            
            this.renderizarTelaPrincipal();
            this.atualizarUI();
            this.mostrarIndicadorTurno();
            
        } catch (error) {
            console.error('Erro ao iniciar o jogo:', error);
            console.log('Erro ao iniciar o jogo. Por favor, recarregue a página e tente novamente.');
        }
    }

    // Renderização da tela principal
    renderizarTelaPrincipal() {
        console.log('Renderizando tela principal...');
        try {
            this.showScreen('game-screen');
            this.renderBoard();
            console.log('Tela principal renderizada com sucesso');
        } catch (error) {
            console.error('Erro ao renderizar tela principal:', error);
        }
    }

    // Mantém compatibilidade
    renderGameScreen() {
        this.renderizarTelaPrincipal();
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = `board-cell ${cell.type}`;
            
            // Adicionar descrição do tipo de casa
            let cellDescription = '';
            switch (cell.type) {
                case 'common': cellDescription = 'Planície'; break;
                case 'treasure': cellDescription = 'Tesouro'; break;
                case 'luck': cellDescription = 'Sorte'; break;
                case 'monster': cellDescription = 'Monstro'; break;
                case 'village': cellDescription = 'Vilarejo'; break;
                case 'event': cellDescription = 'Evento'; break;
                case 'dragon': cellDescription = 'DRAGÃO'; break;
                default: cellDescription = 'Início'; break;
            }
            
            cellElement.innerHTML = `
                <div class="cell-number">${cell.position}</div>
                <div class="cell-emoji">${cell.emoji}</div>
                <div class="cell-description" style="font-size: 0.6rem; color: rgba(255,255,255,0.8); margin-top: 2px;">${cellDescription}</div>
                <div class="cell-players"></div>
            `;
            
            // Adicionar tooltip com informações
            cellElement.title = this.getCellTooltip(cell);
            
            boardElement.appendChild(cellElement);
        });

        this.updatePlayerPositions();
    }

    getCellTooltip(cell) {
        switch (cell.type) {
            case 'common': 
                return 'Planície - Descanso seguro, nada acontece.';
            case 'treasure': 
                return 'Tesouro - Encontre ouro! (1d6 × 5 moedas)';
            case 'luck': 
                return 'Sorte - Puxe uma carta extra, limite temporário de 6 cartas.';
            case 'monster': 
                return 'Monstro - Batalha obrigatória contra uma criatura!';
            case 'village': 
                return 'Vilarejo - Cure PV (1 ouro = 2 PV) ou compre cartas (15 ouro).';
            case 'event': 
                return 'Evento - Surpresas aleatórias podem ajudar ou atrapalhar.';
            case 'dragon': 
                return 'TOCA DO DRAGÃO - Batalha final contra Ignis, o Dragão Ancião!';
            default: 
                return 'Casa inicial - Ponto de partida da aventura.';
        }
    }

    updatePlayerPositions() {
        // Limpar peões existentes
        document.querySelectorAll('.cell-players').forEach(el => el.innerHTML = '');

        // Adicionar peões dos jogadores
        this.players.forEach(player => {
            const cellPlayers = document.querySelectorAll('.cell-players')[player.position];
            if (cellPlayers) {
                const pawn = document.createElement('div');
                pawn.className = 'player-pawn';
                pawn.style.backgroundColor = player.color;
                cellPlayers.appendChild(pawn);
            }
        });

        // Destacar jogador atual
        document.querySelectorAll('.board-cell').forEach(cell => {
            cell.classList.remove('current-player');
        });
        
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer) {
            const currentCell = document.querySelectorAll('.board-cell')[currentPlayer.position];
            if (currentCell) {
                currentCell.classList.add('current-player');
            }
        }
    }

    // Sistema de turnos melhorado
    obterJogadorAtual() {
        return this.players[this.currentPlayerIndex];
    }

    // Mantém compatibilidade
    getCurrentPlayer() {
        return this.obterJogadorAtual();
    }

    proximoJogador() {
        const jogadorAnterior = this.obterJogadorAtual();
        
        // Resetar limite de mão se era temporário
        if (jogadorAnterior.extraHandUntilEndOfTurn) {
            jogadorAnterior.handLimit = 5;
            jogadorAnterior.extraHandUntilEndOfTurn = false;
            
            // Descartar cartas excedentes
            while (jogadorAnterior.hand.length > 5) {
                const randomIndex = Math.floor(Math.random() * jogadorAnterior.hand.length);
                const discardedCard = jogadorAnterior.hand.splice(randomIndex, 1)[0];
                jogadorAnterior.discardPile.push(discardedCard);
            }
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        if (this.currentPlayerIndex === 0) {
            this.round++;
        }
        
        const novoJogador = this.obterJogadorAtual();
        
        // Resetar flag de já ter jogado neste turno
        novoJogador.hasRolledThisTurn = false;
        
        // Garantir que o jogador tenha cartas suficientes na mão
        this.garantirCartasNaMao(novoJogador);
        
        this.atualizarUI();
        this.mostrarIndicadorTurno();
    }

    // Mantém compatibilidade
    nextPlayer() {
        this.proximoJogador();
    }

    // Garantir que o jogador sempre tenha cartas
    garantirCartasNaMao(player, minCards = 5, forceCombat = false) {
        let tentativas = 0;
        
        // Durante combate, só garantir cartas se explicitamente forçado
        if (this.combatState && this.combatState.player === player && !forceCombat) {
            // No combate, não forçar mínimo de cartas a menos que seja solicitado
            return;
        }
        
        while (player.hand.length < minCards && tentativas < 20) {
            const cartaPuxada = this.puxarCarta(player);
            if (!cartaPuxada) {
                // Se não conseguiu puxar carta e deck está vazio, criar cartas básicas
                if (player.deck.length === 0 && player.discardPile.length === 0) {
                    this.adicionarCartasBasicas(player);
                }
                break;
            }
            tentativas++;
        }
        
        // Se está em combate, atualizar as cartas imediatamente
        if (this.combatState && this.combatState.player === player) {
            this.renderCombatCards();
        }
    }

    // Adicionar cartas básicas se o jogador ficar sem cartas
    adicionarCartasBasicas(player) {
        const cartasBasicas = [
            { name: 'Ataque Rápido', type: 'attack', damage: 3, category: 'attack' },
            { name: 'Defesa Simples', type: 'defense', block: 3, category: 'defense' },
            { name: 'Esquiva Ágil', type: 'dodge', dodgeType: 'quick', category: 'dodge' }
        ];
        
        cartasBasicas.forEach(carta => {
            player.deck.push({...carta});
        });
        
        player.deck = this.shuffleDeck(player.deck);
        this.adicionarLogJogo(`${player.name} recebeu cartas básicas de emergência!`);
        this.mostrarNotificacao(`🆘 ${player.name} recebeu cartas de emergência!`, 'warning');
    }

    // Mostrar indicador visual de turno
    mostrarIndicadorTurno() {
        const jogadorAtual = this.obterJogadorAtual();
        
        // Remover indicadores anteriores
        document.querySelectorAll('.turno-atual').forEach(el => {
            el.classList.remove('turno-atual');
        });
        
        // Adicionar indicador de turno atual
        const nomeJogador = document.getElementById('current-player-name');
        if (nomeJogador) {
            nomeJogador.classList.add('turno-atual');
        }
        
        // Mostrar notificação de turno
        this.mostrarNotificacao(`🎮 Turno de ${jogadorAtual.name} !`, 'info');
        
        // Habilitar botão de rolar dados apenas se ainda não jogou neste turno
        const botaoRolar = document.getElementById('roll-dice-btn');
        if (botaoRolar) {
            if (!jogadorAtual.hasRolledThisTurn) {
                botaoRolar.disabled = false;
                botaoRolar.textContent = '🎲 Rolar Dados';
                botaoRolar.style.background = `linear-gradient(45deg, ${jogadorAtual.color}, ${this.darkenColor(jogadorAtual.color, 20)})`;
                botaoRolar.style.animation = 'pulse 2s infinite';
            } else {
                botaoRolar.disabled = true;
                botaoRolar.textContent = 'Já jogou neste turno';
                botaoRolar.style.background = '#555555';
                botaoRolar.style.animation = 'none';
            }
        }
    }

    // Sistema de cartas melhorado
    puxarCarta(player, ignoreLimit = false) {
        if (player.deck.length === 0) {
            // Reembaralhar pilha de descarte se não houver cartas no deck
            if (player.discardPile.length > 0) {
                player.deck = this.shuffleDeck([...player.discardPile]);
                player.discardPile = [];
                this.adicionarLogJogo(`${player.name} reembaralhou as cartas!`);
                this.mostrarNotificacao(`🔄 ${player.name} reembaralhou o deck!`, 'warning');
            } else {
                // Se não há cartas nem no deck nem no descarte, não pode puxar
                this.mostrarNotificacao(`❌ ${player.name} não tem mais cartas!`, 'warning');
                return null;
            }
        }

        // Se ignoreLimit=true (compras/recompensas), pode exceder o limite
        // Se ignoreLimit=false (reabastecimento normal), respeita o limite
        if (player.deck.length > 0 && (ignoreLimit || player.hand.length < player.handLimit)) {
            const card = player.deck.pop();
            player.hand.push(card);
            return card;
        }
        return null;
    }

    // Função específica para compras e recompensas (permite exceder limite)
    puxarCartaExtra(player) {
        return this.puxarCarta(player, true);
    }

    // Mantém compatibilidade com o código existente
    drawCard(player) {
        return this.puxarCarta(player);
    }

    descartarCarta(player, cardIndex) {
        if (cardIndex >= 0 && cardIndex < player.hand.length) {
            const card = player.hand.splice(cardIndex, 1)[0];
            player.discardPile.push(card);
            return card;
        }
        return null;
    }

    // Mantém compatibilidade com o código existente
    discardCard(player, cardIndex) {
        return this.descartarCarta(player, cardIndex);
    }

    // Método auxiliar para logs do jogo em português
    adicionarLogJogo(message) {
        console.log(`[JOGO] ${message}`);
        // Você pode expandir isso para mostrar mensagens na tela se desejar
    }

    // Método auxiliar para logs do jogo
    addGameLog(message) {
        this.adicionarLogJogo(message);
    }

    // Lógica de movimento
    rollDice() {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;

        document.getElementById('dice-result').innerHTML = `
            <div>🎲 ${dice1} + ${dice2} = ${total}</div>
        `;

        return total;
    }

    movePlayer(player, spaces) {
        console.log(`Movendo jogador ${player.name} por ${spaces} casas`);
        const newPosition = Math.min(player.position + spaces, 60);
        player.position = newPosition;
        
        // Marcar que o jogador já jogou neste turno
        player.hasRolledThisTurn = true;
        
        this.updatePlayerPositions();
        
        // Se chegou na casa final, vai direto para o dragão
        if (newPosition === 60) {
            this.handleDragonEncounter(player);
        } else {
            // Resolver a casa - NÃO finalizar turno automaticamente aqui
            this.resolveCell(player, this.board[newPosition]);
        }
    }

    // Resolução de casas
    resolveCell(player, cell) {
        const actionMessage = document.getElementById('action-message');
        const actionButtons = document.getElementById('action-buttons');

        switch (cell.type) {
            case 'common':
                actionMessage.textContent = 'Você descansa em uma planície verdejante.';
                actionButtons.innerHTML = '<button class="btn-primary" onclick="game.finalizarTurno()">Finalizar Turno</button>';
                break;

            case 'treasure':
                const treasureRoll = this.rollDice();
                const goldFound = treasureRoll * 5;
                player.gold += goldFound;
                actionMessage.textContent = `Você encontrou um baú com ${goldFound} moedas de ouro!`;
                actionButtons.innerHTML = '<button class="btn-primary" onclick="game.finalizarTurno()">Finalizar Turno</button>';
                break;

            case 'luck':
                this.puxarCarta(player);
                player.handLimit = 6;
                player.extraHandUntilEndOfTurn = true;
                actionMessage.textContent = 'A sorte sorri para você! Puxou uma carta extra.';
                actionButtons.innerHTML = '<button class="btn-primary" onclick="game.finalizarTurno()">Finalizar Turno</button>';
                break;

            case 'monster':
                this.startCombat(player);
                break;

            case 'village':
                this.handleVillage(player);
                break;

            case 'event':
                this.handleEvent(player);
                break;
        }
    }

    // Sistema de combate
    startCombat(player) {
        if (this.monsterDeck.length === 0) {
            this.monsterDeck = this.initializeMonsterDeck();
        }

        const monster = this.monsterDeck.pop();
        this.combatState = {
            player: player,
            monster: monster,
            turn: 'monster',
            round: 1
        };

        this.showCombatModal();
    }

    showCombatModal() {
        const modal = document.getElementById('combat-modal');
        const player = this.combatState.player;
        const monster = this.combatState.monster;

        // Atualizar informações do combate
        document.getElementById('combat-title').textContent = `Combate vs ${monster.name}`;
        document.getElementById('player-name-combat').textContent = player.name;
        document.getElementById('enemy-name').textContent = monster.name;

        // Configurar avatares dos personagens
        this.setupCombatAvatars(player, monster);

        this.updateCombatUI();
        modal.classList.add('active');
        
        // Ação do monstro
        this.monsterAction();
    }

    setupCombatAvatars(player, monster) {
        const playerAvatar = document.getElementById('player-avatar');
        const enemyAvatar = document.getElementById('enemy-avatar');

        // Definir emoji do jogador baseado na cor ou personalização
        const playerEmojis = ['🛡️', '⚔️', '🏹', '🗡️'];
        const playerIndex = this.players.indexOf(player);
        playerAvatar.textContent = playerEmojis[playerIndex] || '🛡️';
        playerAvatar.style.background = `linear-gradient(135deg, ${player.color}, ${this.darkenColor(player.color, 20)})`;

        // Definir emoji do monstro baseado no tipo
        let monsterEmoji = '👹';
        let monsterBg = 'linear-gradient(135deg, #F44336, #D32F2F)';
        
        if (monster.name.includes('Goblin')) {
            monsterEmoji = '👺';
            monsterBg = 'linear-gradient(135deg, #4CAF50, #388E3C)';
        } else if (monster.name.includes('Orc')) {
            monsterEmoji = '🗡️';
            monsterBg = 'linear-gradient(135deg, #795548, #5D4037)';
        } else if (monster.name.includes('Lobo')) {
            monsterEmoji = '🐺';
            monsterBg = 'linear-gradient(135deg, #424242, #212121)';
        } else if (monster.name.includes('Dragão') || monster.name.includes('Ignis')) {
            monsterEmoji = '🐉';
            monsterBg = 'linear-gradient(135deg, #8B0000, #FF4500, #8B0000)';
            enemyAvatar.className = 'character-avatar dragon-avatar';
        }

        enemyAvatar.textContent = monsterEmoji;
        if (!monster.name.includes('Dragão') && !monster.name.includes('Ignis')) {
            enemyAvatar.style.background = monsterBg;
        }
    }

    // Método auxiliar para escurecer cores
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    updateCombatUI() {
        const player = this.combatState.player;
        const monster = this.combatState.monster;

        // Atualizar HP bars
        const playerHpPercent = (player.hp / player.maxHp) * 100;
        const monsterHpPercent = (monster.hp / monster.maxHp) * 100;

        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        document.getElementById('player-hp-text').textContent = `${player.hp}/${player.maxHp}`;
        
        document.getElementById('enemy-hp-bar').style.width = `${monsterHpPercent}%`;
        document.getElementById('enemy-hp-text').textContent = `${monster.hp}/${monster.maxHp}`;

        if (playerHpPercent <= 25) {
            document.getElementById('player-hp-bar').classList.add('low');
        }

        // Atualizar contadores de deck
        document.getElementById('player-deck-count').textContent = player.deck.length;
        document.getElementById('player-discard-count').textContent = player.discardPile.length;

        // Atualizar cartas de combate
        this.renderCombatCards();
    }

    renderCombatCards() {
        const combatCards = document.getElementById('combat-cards');
        const player = this.combatState.player;

        combatCards.innerHTML = '';
        player.hand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.category}`;
            cardElement.setAttribute('data-card-index', index);
            cardElement.innerHTML = `
                <div>${card.name}</div>
                <div style="font-size: 0.7rem; margin-top: 4px;">
                    ${this.getCardDescription(card)}
                </div>
            `;
            
            // Criar função única para evitar múltiplos cliques
            cardElement.onclick = () => {
                // Verificar se a carta ainda existe
                if (player.hand[index]) {
                    this.selectCombatCard(index);
                }
            };
            
            combatCards.appendChild(cardElement);
        });
    }

    getCardDescription(card) {
        switch (card.type) {
            case 'attack':
                return `${card.damage} dano${card.piercing ? ' (perfura)' : ''}`;
            case 'defense':
                return `Bloqueia ${card.block}`;
            case 'dodge':
                if (card.dodgeType === 'any') {
                    return 'Esquiva qualquer ataque';
                }
                return `Esquiva ${card.dodgeType === 'quick' ? 'ágil' : 'pesada'}`;
            case 'heal':
                return `Cura ${card.healing} PV`;
            case 'counter':
                return `Bloqueia ${card.block}, contra-ataca ${card.counterDamage}`;
            case 'refresh':
                return `Descarte até 3 cartas e puxe novas`;
            default:
                return '';
        }
    }

    monsterAction() {
        const monster = this.combatState.monster;
        const attack = monster.attack;
        
        this.addCombatLog(`${monster.name} usa ${attack.name} (${attack.damage} de dano)!`);
        
        // Aguardar ação do jogador
        document.getElementById('combat-buttons').innerHTML = `
            <div style="text-align: center; margin: 15px 0;">
                <p>Escolha uma carta para responder ao ataque!</p>
            </div>
        `;
    }

    selectCombatCard(cardIndex) {
        const player = this.combatState.player;
        const monster = this.combatState.monster;
        const card = player.hand[cardIndex];
        
        // Verificar se a carta ainda existe
        if (!card) {
            console.log('Carta não encontrada no índice', cardIndex);
            return;
        }
        
        const monsterAttack = monster.attack;
        
        // Verificar se o ataque do monstro está definido
        if (!monsterAttack) {
            console.error('Ataque do monstro não definido');
            return;
        }

        this.addCombatLog(`${player.name} usa ${card.name}!`);

        // Resolver combate
        this.resolveCombatRound(card, monsterAttack);

        // Remover carta da mão
        player.hand.splice(cardIndex, 1);
        player.discardPile.push(card);

        // VERIFICAÇÃO CRÍTICA DE HP IMEDIATAMENTE APÓS COMBATE
        console.log(`[DEBUG] HP após combate - Jogador: ${player.hp}, Monstro: ${monster.hp}`);
        
        // Verificar se o jogador morreu PRIMEIRO (prioritário)
        if (player.hp <= 0) {
            console.log(`[DEBUG] Jogador ${player.name} chegou a 0 HP - Executando loseCombat`);
            this.addCombatLog(`💀 ${player.name} foi derrotado! 💀`);
            this.loseCombat();
            return; // Sair imediatamente após derrota
        }
        
        // Verificar se o monstro morreu
        if (monster.hp <= 0) {
            console.log(`[DEBUG] Monstro ${monster.name} chegou a 0 HP - Executando vitória`);
            if (this.combatState.isDragon) {
                this.defeatDragon(player);
            } else {
                this.winCombat();
            }
            return; // Sair imediatamente após vitória
        }

        // Verificar se a mão ficou vazia e reabastecer se necessário
        if (player.hand.length === 0) {
            this.addCombatLog(`${player.name} ficou sem cartas! Reabastecendo a mão...`);
            this.garantirCartasNaMao(player, 5, true); // Forçar reabastecimento com 5 cartas
        }

        // Atualizar UI
        this.updateCombatUI();
        
        // Se ambos ainda estão vivos, continuar combate
        this.combatState.round++;
        
        // Próximo turno do monstro/dragão após um delay
        setTimeout(() => {
            if (this.combatState.isDragon) {
                this.dragonAction();
            } else {
                this.monsterAction();
            }
        }, 1500);
    }

    resolveCombatRound(playerCard, monsterAttack) {
        const player = this.combatState.player;
        const monster = this.combatState.monster;

        let playerDamage = 0;
        let monsterDamage = monsterAttack.damage;

        switch (playerCard.type) {
            case 'attack':
                // Jogador ataca
                playerDamage = playerCard.damage;
                if (playerCard.piercing) {
                    this.addCombatLog(`Ataque perfurante ignora defesas!`);
                }
                
                // Monstro ataca
                player.hp = Math.max(0, player.hp - monsterDamage);
                this.addCombatLog(`Ambos se atacam! ${player.name} causa ${playerDamage}, ${monster.name} causa ${monsterDamage}.`);
                break;

            case 'defense':
                // Bloquear ataque
                const blockedDamage = Math.min(monsterDamage, playerCard.block);
                const remainingDamage = monsterDamage - blockedDamage;
                
                if (remainingDamage > 0) {
                    player.hp = Math.max(0, player.hp - remainingDamage);
                    this.addCombatLog(`Bloqueou ${blockedDamage} de dano, mas sofreu ${remainingDamage}.`);
                } else {
                    this.addCombatLog(`Bloqueou todo o dano!`);
                }
                break;

            case 'dodge':
                // Esquiva
                let correctDodge = false;
                
                if (playerCard.dodgeType === 'any') {
                    // Esquiva Mestre - funciona contra qualquer ataque
                    correctDodge = true;
                } else {
                    correctDodge = (
                        (playerCard.dodgeType === 'quick' && monsterAttack.damage <= 3) ||
                        (playerCard.dodgeType === 'heavy' && monsterAttack.damage >= 4)
                    );
                }

                if (correctDodge) {
                    this.addCombatLog(`Esquiva perfeita! Evitou todo o dano.`);
                    if (playerCard.reward === 'drawCard') {
                        // Usar puxarCartaExtra para recompensas de esquiva
                        const cartaRecompensa = this.puxarCartaExtra(player);
                        if (cartaRecompensa) {
                            this.addCombatLog(`Puxou ${cartaRecompensa.name} como recompensa pela esquiva!`);
                        }
                    }
                } else {
                    player.hp = Math.max(0, player.hp - monsterDamage);
                    this.addCombatLog(`Esquiva incorreta! Sofreu ${monsterDamage} de dano.`);
                }
                break;

            case 'heal':
                // Cura
                const healAmount = Math.min(playerCard.healing, player.maxHp - player.hp);
                player.hp += healAmount;
                player.hp = Math.max(0, player.hp - monsterDamage);
                this.addCombatLog(`Curou ${healAmount} PV, mas sofreu ${monsterDamage} de dano.`);
                break;

            case 'counter':
                // Contra-ataque
                const counterBlocked = Math.min(monsterDamage, playerCard.block);
                const counterRemaining = monsterDamage - counterBlocked;
                
                if (counterRemaining > 0) {
                    player.hp = Math.max(0, player.hp - counterRemaining);
                    this.addCombatLog(`Bloqueou ${counterBlocked}, mas sofreu ${counterRemaining}.`);
                } else {
                    playerDamage = playerCard.counterDamage;
                    this.addCombatLog(`Bloqueou completamente e contra-atacou por ${playerDamage}!`);
                }
                break;
        }

        // Aplicar dano ao monstro
        let finalDamage = playerDamage;
        
        // Couro Impenetrável do Dragão (reduzido para 1)
        if (this.combatState.isDragon && playerDamage > 0) {
            const armorReduction = Math.min(1, playerDamage); // Reduzido de 2 para 1
            finalDamage = Math.max(0, playerDamage - armorReduction);
            if (armorReduction > 0) {
                this.addCombatLog(`🛡️ Couro Impenetrável absorveu ${armorReduction} de dano!`);
            }
        }
        
        monster.hp = Math.max(0, monster.hp - finalDamage);
        if (finalDamage > 0) {
            this.addCombatLog(`${monster.name} sofreu ${finalDamage} de dano!`);
        }

        // Efeitos especiais do monstro
        if (monsterAttack.special === 'discard' && player.hp > 0 && monsterDamage > 0) {
            if (player.hand.length > 0) {
                const randomIndex = Math.floor(Math.random() * player.hand.length);
                const discardedCard = player.hand.splice(randomIndex, 1)[0];
                player.discardPile.push(discardedCard);
                this.addCombatLog(`${player.name} descartou ${discardedCard.name}!`);
            }
        }

        this.updateCombatUI();
    }

    addCombatLog(message) {
        const log = document.getElementById('combat-log');
        const entry = document.createElement('div');
        entry.textContent = `> ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    winCombat() {
        const player = this.combatState.player;
        const monster = this.combatState.monster;
        const reward = monster.reward;

        this.addCombatLog(`${monster.name} foi derrotado!`);
        
        // Aplicar recompensas
        player.gold += reward.gold;
        this.addCombatLog(`Ganhou ${reward.gold} moedas de ouro!`);
        
        if (reward.drawCard) {
            // Usar puxarCartaExtra para recompensas (pode exceder limite)
            const cartaRecompensa = this.puxarCartaExtra(player);
            if (cartaRecompensa) {
                this.addCombatLog(`Puxou ${cartaRecompensa.name} como recompensa!`);
            } else {
                this.addCombatLog(`Não foi possível puxar carta de recompensa (deck vazio)!`);
            }
        }

        // Puxar cartas até ter 5 na mão (sistema melhorado)
        this.garantirCartasNaMao(player, 5, true);

        // Efeito visual de vitória
        setTimeout(() => {
            document.getElementById('combat-buttons').innerHTML = `
                <button class="btn-primary" onclick="game.endCombat()" style="animation: pulse 2s infinite;">🏆 Vitória! Continuar 🏆</button>
            `;
        }, 1000);
    }

    loseCombat() {
        const player = this.combatState.player;
        
        this.addCombatLog(`${player.name} foi derrotado!`);
        
        // Penalidades
        player.gold = Math.floor(player.gold / 2);
        player.hp = 10;
        
        // Voltar para último vilarejo ou início
        let lastVillage = 0;
        for (let i = player.position - 1; i >= 0; i--) {
            if (this.board[i].type === 'village') {
                lastVillage = i;
                break;
            }
        }
        player.position = lastVillage;
        
        this.addCombatLog(`Voltou para a posição ${lastVillage} com 10 PV e metade do ouro.`);

        document.getElementById('combat-buttons').innerHTML = `
            <button class="btn-primary" onclick="game.endCombat()">Continuar</button>
        `;
    }

    endCombat() {
        document.getElementById('combat-modal').classList.remove('active');
        this.combatState = null;
        this.updatePlayerPositions();
        this.finalizarTurno();
    }

    // Sistema de eventos
    handleEvent(player) {
        if (this.eventDeck.length === 0) {
            this.eventDeck = this.initializeEventDeck();
        }

        const event = this.eventDeck.pop();
        this.showEventModal(event, player);
    }

    showEventModal(event, player) {
        const modal = document.getElementById('event-modal');
        const content = document.getElementById('event-content');

        content.innerHTML = `
            <h4>${event.title}</h4>
            <p>${event.description}</p>
        `;

        if (event.type === 'choice') {
            const buttons = event.options.map((option, index) => {
                const canAfford = !option.cost || player.gold >= option.cost;
                const disabled = canAfford ? '' : 'disabled';
                return `<button class="btn-secondary" ${disabled} onclick="game.selectEventOption(${index})">${option.text}</button>`;
            }).join('');
            
            content.innerHTML += `<div style="margin-top: 15px;">${buttons}</div>`;
            
            this.currentEvent = { event, player };
        } else {
            this.resolveEvent(event, player);
        }

        modal.classList.add('active');
    }

    selectEventOption(optionIndex) {
        const { event, player } = this.currentEvent;
        const option = event.options[optionIndex];

        if (option.cost && player.gold >= option.cost) {
            player.gold -= option.cost;
        }

        if (option.effect === 'heal') {
            const healAmount = Math.min(option.value, player.maxHp - player.hp);
            player.hp += healAmount;
        }

        this.closeEventModal();
    }

    resolveEvent(event, player) {
        switch (event.type) {
            case 'damage':
                player.hp = Math.max(0, player.hp - event.damage);
                break;
            case 'heal':
                const healAmount = Math.min(event.healing, player.maxHp - player.hp);
                player.hp += healAmount;
                break;
            case 'goldLoss':
                const lostGold = Math.floor(player.gold * event.amount);
                player.gold = Math.max(0, player.gold - lostGold);
                break;
            case 'drawCards':
                for (let i = 0; i < event.amount; i++) {
                    // Usar puxarCartaExtra para eventos (pode exceder limite)
                    this.puxarCartaExtra(player);
                }
                break;
            case 'gold':
                player.gold += event.amount;
                break;
        }
    }

    closeEventModal() {
        document.getElementById('event-modal').classList.remove('active');
        this.finalizarTurno();
    }

    // Sistema de vilarejo melhorado
    handleVillage(player) {
        const actionMessage = document.getElementById('action-message');
        const actionButtons = document.getElementById('action-buttons');

        actionMessage.textContent = 'Você chegou a um vilarejo seguro!';
        actionButtons.innerHTML = `
            <button class="btn-secondary" onclick="game.comprarCura()">Curar PV (1 ouro = 2 PV)</button>
            <button class="btn-secondary" onclick="game.comprarCarta()">Comprar Carta (15 ouro)</button>
            <button class="btn-secondary" onclick="game.comprarCartaEspecial()">Comprar Carta Especial (25 ouro)</button>
            <button class="btn-primary" onclick="game.finalizarTurno()">Finalizar Turno</button>
        `;
    }

    // Mantém compatibilidade
    buyHealing() {
        this.comprarCura();
    }

    // Mantém compatibilidade  
    buyCard() {
        this.comprarCarta();
    }

    comprarCura() {
        const player = this.obterJogadorAtual();
        if (player.gold >= 1 && player.hp < player.maxHp) {
            const maxHeal = Math.floor((player.maxHp - player.hp + 1) / 2);
            const canAfford = Math.min(maxHeal, player.gold);
            
            if (canAfford > 0) {
                const healAmount = canAfford * 2;
                player.gold -= canAfford;
                player.hp = Math.min(player.maxHp, player.hp + healAmount);
                
                document.getElementById('action-message').textContent = 
                    `Curou ${healAmount} PV por ${canAfford} ouro!`;
            }
        }
        this.atualizarUI();
    }

    comprarCarta() {
        const player = this.obterJogadorAtual();
        if (player.gold >= 15) {
            player.gold -= 15;
            // Usar puxarCartaExtra para permitir exceder limite de 5 cartas
            const cartaPuxada = this.puxarCartaExtra(player);
            if (cartaPuxada) {
                document.getElementById('action-message').textContent = 
                    `Comprou ${cartaPuxada.name} por 15 ouro! (${player.hand.length} cartas na mão)`;
            } else {
                document.getElementById('action-message').textContent = 
                    'Não foi possível comprar carta (deck vazio)!';
            }
        } else {
            document.getElementById('action-message').textContent = 
                'Ouro insuficiente para comprar carta (15 ouro necessário)!';
        }
        this.atualizarUI();
    }

    comprarCartaEspecial() {
        const player = this.obterJogadorAtual();
        if (player.gold >= 25) {
            player.gold -= 25;
            
            // Cartas especiais disponíveis
            const cartasEspeciais = [
                { name: 'Cura Maior', type: 'heal', healing: 12, category: 'special' },
                { name: 'Ataque Devastador', type: 'attack', damage: 8, category: 'attack' },
                { name: 'Escudo Dragão', type: 'defense', block: 8, category: 'defense' },
                { name: 'Esquiva Mestre', type: 'dodge', dodgeType: 'any', reward: 'drawCard', category: 'dodge' }
            ];
            
            const cartaEscolhida = cartasEspeciais[Math.floor(Math.random() * cartasEspeciais.length)];
            // Adicionar diretamente à mão (cartas especiais sempre podem exceder limite)
            player.hand.push(cartaEscolhida);
            
            document.getElementById('action-message').textContent = 
                `Comprou ${cartaEscolhida.name} por 25 ouro! (${player.hand.length} cartas na mão)`;
        } else {
            document.getElementById('action-message').textContent = 
                'Ouro insuficiente para carta especial (25 ouro necessário)!';
        }
        this.atualizarUI();
    }

    // Encontro com o Dragão - Mais Balanceado
    handleDragonEncounter(player) {
        player.dragonAttempts++;
        
        const dragon = {
            name: 'Ignis, o Dragão Ancião',
            hp: 30,
            maxHp: 30,
            armor: 1,
            attacks: [
                { name: 'Golpe de Garra', damage: 5, type: 'heavy' }, 
                { name: 'Baforada de Fogo', damage: 6, type: 'fire' },
                { name: 'Golpe de Cauda', damage: 3, type: 'knockback' }
            ],
            currentAttack: 0,
            round: 1
        };


        dragon.attack = dragon.attacks[0];

        this.combatState = {
            player: player,
            monster: dragon,
            turn: 'monster',
            round: 1,
            isDragon: true
        };

        this.showDragonCombat();
    }

    showDragonCombat() {
        const modal = document.getElementById('combat-modal');
        document.getElementById('combat-title').innerHTML = `
            <span style="color: #FF4500; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                🐉 COMBATE FINAL vs IGNIS, O DRAGÃO ANCIÃO 🐉
            </span>
        `;
        
        // Configurar avatar do dragão
        const playerAvatar = document.getElementById('player-avatar');
        const enemyAvatar = document.getElementById('enemy-avatar');
        const player = this.combatState.player;
        
        // Avatar do jogador
        const playerEmojis = ['🛡️', '⚔️', '🏹', '🗡️'];
        const playerIndex = this.players.indexOf(player);
        playerAvatar.textContent = playerEmojis[playerIndex] || '🛡️';
        playerAvatar.style.background = `linear-gradient(135deg, ${player.color}, ${this.darkenColor(player.color, 20)})`;
        
        // Avatar do dragão - mais épico
        enemyAvatar.textContent = '🐉';
        enemyAvatar.className = 'character-avatar dragon-avatar';
        
        this.updateCombatUI();
        modal.classList.add('active');
        
        this.addCombatLog('🔥 O Dragão Ancião desperta do seu sono milenar! 🔥');
        this.addCombatLog('🌋 As chamas do inferno dançam em seus olhos! 🌋');
        this.addCombatLog('⚡ A batalha final começou! ⚡');
        this.dragonAction();
    }

    dragonAction() {
        const dragon = this.combatState.monster;
        
        const currentAttack = dragon.attacks[dragon.currentAttack];
        
        // Definir o ataque atual para o sistema de combate
        dragon.attack = currentAttack;
        
        let attackMessage = '';
        switch (currentAttack.name) {
            case 'Golpe de Garra':
                attackMessage = `🦅 ${dragon.name} desfere um ${currentAttack.name} devastador! (${currentAttack.damage} de dano) 🦅`;
                break;
            case 'Baforada de Fogo':
                attackMessage = `🔥 ${dragon.name} cospe uma ${currentAttack.name} infernal! (${currentAttack.damage} de dano) 🔥`;
                break;
            case 'Golpe de Cauda':
                attackMessage = `💥 ${dragon.name} varre com sua cauda poderosa! (${currentAttack.damage} de dano) 💥`;
                break;
        }
        
        this.addCombatLog(attackMessage);
        
        // Próximo ataque na sequência
        dragon.currentAttack = (dragon.currentAttack + 1) % dragon.attacks.length;
        dragon.round++;
        
        document.getElementById('combat-buttons').innerHTML = `
            <div style="text-align: center; margin: 15px 0;">
                <p style="color: #FF4500; font-weight: bold; font-size: 1.2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    ⚔️ DRAGÃO ANCIÃO! Escolha sua carta sabiamente! ⚔️
                </p>
                <p style="color: #FFD700; font-size: 0.9rem;">
                    Lembre-se: O dragão tem Couro Impenetrável (-1 dano)
                </p>
            </div>
        `;
    }

    // Fim do jogo
    defeatDragon(player) {
        this.dragonsDefeated.push(player);
        player.gold += 100;
        
        this.addCombatLog(`🏆 ${player.name} derrotou o lendário Ignis, o Dragão Ancião! 🏆`);
        this.addCombatLog(`💰 Recebeu 100 moedas de ouro como recompensa épica! 💰`);
        this.addCombatLog(`⭐ Uma nova lenda nasceu no reino! ⭐`);
        
        // Reabastecer mão após vitória
        this.garantirCartasNaMao(player, 5, true);
        
        // Efeito visual épico de vitória
        setTimeout(() => {
            document.getElementById('combat-buttons').innerHTML = `
                <button class="btn-primary" onclick="game.endGame()" 
                        style="animation: pulse 1s infinite; background: linear-gradient(45deg, #ffd700, #ff6b35); font-size: 1.2rem; padding: 15px 30px;">
                    🏆 VITÓRIA ÉPICA! Fim do Jogo! 🏆
                </button>
            `;
        }, 2000);
    }

    endGame() {
        document.getElementById('combat-modal').classList.remove('active');
        
        // Determinar vencedor
        const winners = this.dragonsDefeated.length > 0 ? this.dragonsDefeated : this.players;
        const winner = winners.reduce((prev, current) => 
            (prev.gold > current.gold) ? prev : current
        );

        this.showVictoryModal(winner);
    }

    showVictoryModal(winner) {
        const modal = document.getElementById('victory-modal');
        const message = document.getElementById('victory-message');
        const scores = document.getElementById('final-scores');

        message.innerHTML = `
            <h3>🏆 ${winner.name} é a nova lenda do reino! 🏆</h3>
            <p>Com ${winner.gold} moedas de ouro, provou ser o herói mais valoroso!</p>
        `;

        // Mostrar placar final
        const sortedPlayers = [...this.players].sort((a, b) => b.gold - a.gold);
        scores.innerHTML = `
            <h4>Placar Final:</h4>
            ${sortedPlayers.map((player, index) => `
                <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    <strong>${index + 1}°. ${player.name}</strong> - ${player.gold} ouro
                    ${this.dragonsDefeated.includes(player) ? ' 🐉' : ''}
                </div>
            `).join('')}
        `;

        modal.classList.add('active');
    }

    // Gerenciamento de turnos melhorado
    finalizarTurno() {
        // Resetar animações do botão
        const botaoRolar = document.getElementById('roll-dice-btn');
        if (botaoRolar) {
            botaoRolar.style.animation = 'none';
            botaoRolar.disabled = true;
        }
        
        this.proximoJogador();
    }

    // Mantém compatibilidade
    endTurn() {
        this.finalizarTurno();
    }

    // Atualização da UI em português
    atualizarUI() {
        const jogadorAtual = this.obterJogadorAtual();
        if (!jogadorAtual) return;

        // Atualizar informações do jogador atual
        document.getElementById('current-player-name').textContent = jogadorAtual.name;
        document.getElementById('current-player-name').style.color = jogadorAtual.color;
        document.getElementById('round-counter').textContent = ` Rodada ${this.round}`;
        document.getElementById('player-hp').textContent = `${jogadorAtual.hp}/${jogadorAtual.maxHp}`;
        document.getElementById('player-gold').textContent = jogadorAtual.gold;
        document.getElementById('player-position').textContent = jogadorAtual.position;

        // Adicionar informação sobre cartas restantes
        const deckInfo = document.createElement('div');
        deckInfo.style.fontSize = '0.8rem';
        deckInfo.style.color = '#cccccc';
        deckInfo.style.marginTop = '5px';
        
        // Destacar quando tem cartas extras
        const cartasExtras = jogadorAtual.hand.length > jogadorAtual.handLimit;
        const corMao = cartasExtras ? '#ffd700' : '#cccccc';
        const textoExtra = cartasExtras ? ' (+Extra!)' : '';
        
        deckInfo.innerHTML = `
            Deck: ${jogadorAtual.deck.length} | 
            Descarte: ${jogadorAtual.discardPile.length} | 
            <span style="color: ${corMao}; font-weight: ${cartasExtras ? 'bold' : 'normal'};">
                Mão: ${jogadorAtual.hand.length}/${jogadorAtual.handLimit}${textoExtra}
            </span>
        `;
        
        // Remover info anterior se existir
        const existingInfo = document.querySelector('.deck-info-game');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        deckInfo.className = 'deck-info-game';
        document.querySelector('.player-stats').appendChild(deckInfo);

        // Atualizar cartas na mão
        this.renderizarMaoJogador(jogadorAtual);
        
        // Atualizar posições no tabuleiro
        this.updatePlayerPositions();

        // Botão de rolar dados
        const rollButton = document.getElementById('roll-dice-btn');
        if (rollButton) {
            rollButton.disabled = false;
            rollButton.textContent = '🎲 Rolar Dados';
            rollButton.style.background = `linear-gradient(45deg, ${jogadorAtual.color}, ${this.darkenColor(jogadorAtual.color, 20)})`;
        }
    }

    // Mantém compatibilidade
    updateUI() {
        this.atualizarUI();
    }

    renderizarMaoJogador(player) {
        const handCards = document.getElementById('hand-cards');
        if (!handCards) return;
        
        handCards.innerHTML = '';

        player.hand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.category}`;
            cardElement.innerHTML = `
                <div style="font-weight: bold;">${card.name}</div>
                <div style="font-size: 0.7rem; margin-top: 4px;">
                    ${this.getCardDescription(card)}
                </div>
            `;
            
            // Usar atributo data para evitar problemas de closure
            cardElement.setAttribute('data-card-index', index);
            
            if (card.type === 'heal') {
                cardElement.onclick = (event) => {
                    const cardIndex = parseInt(event.currentTarget.getAttribute('data-card-index'));
                    if (player.hand[cardIndex] && player.hand[cardIndex].type === 'heal') {
                        event.currentTarget.style.opacity = '0.5';
                        event.currentTarget.style.pointerEvents = 'none';
                        this.usarCartaCura(cardIndex);
                    }
                };
                cardElement.style.cursor = 'pointer';
                cardElement.title = 'Clique para usar esta carta de cura';
            } else if (card.type === 'refresh') {
                cardElement.onclick = (event) => {
                    const cardIndex = parseInt(event.currentTarget.getAttribute('data-card-index'));
                    if (player.hand[cardIndex] && player.hand[cardIndex].type === 'refresh') {
                        event.currentTarget.style.opacity = '0.5';
                        event.currentTarget.style.pointerEvents = 'none';
                        this.usarFolegoRenovado(cardIndex);
                    }
                };
                cardElement.style.cursor = 'pointer';
                cardElement.title = 'Clique para descartar e puxar novas cartas';
            }
            
            handCards.appendChild(cardElement);
        });
    }

    // Mantém compatibilidade
    renderPlayerHand(player) {
        this.renderizarMaoJogador(player);
    }

    usarCartaCura(cardIndex) {
        const player = this.obterJogadorAtual();
        const card = player.hand[cardIndex];
        
        if (card.type === 'heal' && player.hp < player.maxHp) {
            const healAmount = Math.min(card.healing, player.maxHp - player.hp);
            player.hp += healAmount;
            
            // Remover carta da mão
            player.hand.splice(cardIndex, 1);
            player.discardPile.push(card);
            
            document.getElementById('action-message').textContent = 
                `Usou ${card.name} e curou ${healAmount} PV!`;
            
            this.atualizarUI();
        }
    }

    // Mantém compatibilidade
    useHealingCard(cardIndex) {
        this.usarCartaCura(cardIndex);
    }

    usarFolegoRenovado(cardIndex) {
        const player = this.obterJogadorAtual();
        const card = player.hand[cardIndex];
        
        if (card.type === 'refresh') {
            // Se estiver em combate, usar o player do combate
            const jogadorAtivo = this.combatState ? this.combatState.player : player;
            
            // Remover a carta Fôlego Renovado da mão
            jogadorAtivo.hand.splice(cardIndex, 1);
            jogadorAtivo.discardPile.push(card);
            
            // Mostrar opções de cartas para descartar
            this.mostrarSelecaoDescarte(jogadorAtivo);
        }
    }

    mostrarSelecaoDescarte(player) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            padding: 20px;
            border-radius: 15px;
            border: 2px solid #ffd700;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
        `;
        
        content.innerHTML = `
            <h3 style="color: #ffd700; text-align: center;">Fôlego Renovado</h3>
            <p style="color: white; text-align: center;">Escolha até 3 cartas para descartar:</p>
            <div id="cartas-selecao" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;"></div>
            <div style="text-align: center;">
                <button id="confirmar-descarte" class="btn-primary" style="margin: 10px;">Confirmar</button>
                <button id="cancelar-descarte" class="btn-secondary" style="margin: 10px;">Cancelar</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Renderizar cartas para seleção
        const cartasContainer = content.querySelector('#cartas-selecao');
        const cartasSelecionadas = [];
        
        player.hand.forEach((card, index) => {
            const cartaEl = document.createElement('div');
            cartaEl.className = `card ${card.category}`;
            cartaEl.style.cursor = 'pointer';
            cartaEl.innerHTML = `
                <div style="font-weight: bold;">${card.name}</div>
                <div style="font-size: 0.7rem; margin-top: 4px;">
                    ${this.getCardDescription(card)}
                </div>
            `;
            
            cartaEl.onclick = () => {
                if (cartasSelecionadas.includes(index)) {
                    // Remover seleção
                    cartasSelecionadas.splice(cartasSelecionadas.indexOf(index), 1);
                    cartaEl.style.opacity = '1';
                    cartaEl.style.border = '2px solid transparent';
                } else if (cartasSelecionadas.length < 3) {
                    // Adicionar seleção
                    cartasSelecionadas.push(index);
                    cartaEl.style.opacity = '0.7';
                    cartaEl.style.border = '2px solid #ffd700';
                }
            };
            
            cartasContainer.appendChild(cartaEl);
        });
        
        // Botão confirmar
        content.querySelector('#confirmar-descarte').onclick = () => {
            // Descartar cartas selecionadas (do maior índice para o menor)
            cartasSelecionadas.sort((a, b) => b - a).forEach(index => {
                const cartaDescartada = player.hand.splice(index, 1)[0];
                player.discardPile.push(cartaDescartada);
            });
            
            // Puxar o mesmo número de cartas descartadas + 1 (característica do Fôlego Renovado)
            const cartasParaPuxar = cartasSelecionadas.length + 1;
            for (let i = 0; i < cartasParaPuxar; i++) {
                // Usar puxarCartaExtra para permitir exceder limite
                this.puxarCartaExtra(player);
            }
            
            document.body.removeChild(modal);
            
            // Atualizar UI dependendo do contexto
            if (this.combatState && this.combatState.player === player) {
                this.updateCombatUI();
                this.addCombatLog(`Fôlego Renovado! Descartou ${cartasSelecionadas.length} cartas e puxou ${cartasParaPuxar} novas!`);
            } else {
                this.atualizarUI();
                document.getElementById('action-message').textContent = 
                    `Fôlego Renovado! Descartou ${cartasSelecionadas.length} cartas e puxou ${cartasParaPuxar} novas!`;
            }
        };
        
        // Botão cancelar
        content.querySelector('#cancelar-descarte').onclick = () => {
            // Devolver a carta para a mão
            const cartaFolego = player.discardPile.pop();
            player.hand.push(cartaFolego);
            document.body.removeChild(modal);
            
            // Atualizar UI dependendo do contexto
            if (this.combatState && this.combatState.player === player) {
                this.updateCombatUI();
            } else {
                this.atualizarUI();
            }
        };
    }

    // Navegação entre telas
    showScreen(screenId) {
        console.log(`Tentando mostrar tela: ${screenId}`);
        try {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                console.log(`Tela ${screenId} ativada com sucesso`);
            } else {
                console.error(`Tela ${screenId} não encontrada no DOM`);
            }
        } catch (error) {
            console.error(`Erro ao mostrar tela ${screenId}:`, error);
        }
    }

    // Configuração de jogadores
    updatePlayerInputs() {
        const playerCount = parseInt(document.getElementById('playerCount').value);
        const container = document.getElementById('player-inputs');
        
        container.innerHTML = '';
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        const colorNames = ['Vermelho', 'Verde-água', 'Azul', 'Verde'];
        
        for (let i = 0; i < playerCount; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input';
            playerDiv.innerHTML = `
                <div class="player-header">
                    <h3>Herói ${i + 1}</h3>
                </div>
                <div class="input-group">
                    <label>Nome:</label>
                    <input type="text" id="player${i}Name" placeholder="Digite o nome do herói" maxlength="15">
                </div>
                <div class="input-group">
                    <label>Cor:</label>
                    <div class="color-options">
                        ${colors.map((color, index) => `
                            <label class="color-option">
                                <input type="radio" name="player${i}Color" value="${color}" ${index === i ? 'checked' : ''}>
                                <span class="color-preview" style="background-color: ${color}"></span>
                                <span class="color-name">${colorNames[index]}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            container.appendChild(playerDiv);
        }
    }

    selectColor(playerIndex, color) {
        const radio = document.querySelector(`input[name="player${playerIndex}Color"][value="${color}"]`);
        if (radio) {
            radio.checked = true;
        }
    }

    // Método auxiliar para mostrar notificações
    mostrarNotificacao(message, type = 'info') {
        // Se existe uma função de notificação, usar. Senão, usar console.log
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Funções globais para compatibilidade com HTML
let game;

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    try {
        game = new WarriorsQuest();
        console.log('Jogo inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o jogo:', error);
        setTimeout(() => {
            try {
                game = new WarriorsQuest();
                console.log('Jogo inicializado na segunda tentativa!');
            } catch (secondError) {
                console.error('Erro crítico:', secondError);
            }
        }, 100);
    }
});

// Funções globais para o HTML
function showMainMenu() {
    console.log('Voltando ao menu principal...');
    if (game) {
        // Resetar estado do jogo
        game.gameState = 'menu';
        game.combatState = null;
        
        // Fechar todos os modais
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        game.showScreen('main-menu');
    }
}

function showPlayerSetup() {
    if (game) {
        game.showScreen('player-setup');
        updatePlayerInputs();
    }
}

function showRules() {
    if (game) {
        game.showScreen('rules');
    }
}

function startGame() {
    if (game) {
        // Fechar modal de vitória se estiver aberto
        const victoryModal = document.getElementById('victory-modal');
        if (victoryModal) {
            victoryModal.classList.remove('active');
        }
        game.startGame();
    }
}

function updatePlayerInputs() {
    if (game) {
        game.updatePlayerInputs();
    }
}

function selectColor(playerIndex, color) {
    if (game) {
        game.selectColor(playerIndex, color);
    }
}

function closeEventModal() {
    if (game) {
        game.closeEventModal();
    }
}

// Função para rolar dados
function rollDice() {
    if (game && game.gameState === 'playing') {
        const currentPlayer = game.getCurrentPlayer();
        if (currentPlayer && !currentPlayer.hasRolledThisTurn) {
            const result = game.rollDice();
            game.movePlayer(currentPlayer, result);
        }
    }
}
