# Warrior's Quest: O Desafio do Dragão Dourado

Um jogo de tabuleiro digital baseado em navegador, onde heróis corajosos enfrentam monstros, coletam tesouros e lutam pelo direito de enfrentar o temível Dragão Ancião.

## Como Jogar

1. **Abra o arquivo `index.html` em qualquer navegador moderno**
2. **Configure os jogadores** (2-4 jogadores suportados)
3. **Role os dados** para mover pelo tabuleiro de 60 casas
4. **Resolva eventos** de cada casa que parar
5. **Lute contra monstros** usando cartas estratégicas
6. **Colete ouro** e gerencie seus recursos
7. **Enfrente o Dragão Final** na casa 60
8. **Vença** sendo o herói com mais ouro entre os que derrotaram o dragão!

## Características do Jogo

### 🎯 Objetivo
- Chegar à Toca do Dragão (casa 60)
- Derrotar Ignis, o Dragão Ancião
- Ter mais ouro que os outros vencedores

### 🏰 Tipos de Casa
- **🟢 Planície**: Descanso seguro
- **💰 Tesouro**: Ganhe ouro (1d6 × 5)
- **🃏 Sorte**: Puxe carta extra, limite temporário de 6 cartas
- **👹 Monstro**: Combate obrigatório
- **⛺ Vilarejo**: Cure PV (1 ouro = 2 PV) ou compre cartas (15 ouro)
- **❓ Evento**: Surpresas aleatórias
- **🐉 Dragão**: Batalha final épica!

### ⚔️ Sistema de Combate
18 cartas por jogador divididas em:

**Ataques:**
- Ataque Rápido (4x): 3 de dano
- Ataque Forte (3x): 5 de dano  
- Golpe Perfurante (2x): 2 de dano que ignora defesas

**Defesas:**
- Defesa Simples (3x): Bloqueia até 3 de dano
- Escudo Barricada (1x): Bloqueia até 6 de dano

**Esquivas:**
- Esquiva Ágil (2x): Evita ataques de 3 ou menos
- Antecipação (1x): Evita ataques de 4+, puxe carta se bem-sucedido

**Especiais:**
- Poção de Cura (1x): Cure 8 PV a qualquer momento
- Contra-Ataque (1x): Bloqueia 4 e contra-ataca com 2

### 🐉 O Dragão Final
**Ignis, o Dragão Ancião:**
- 40 PV
- Couro Impenetrável: Ignora 2 pontos de dano de qualquer ataque
- Ações Múltiplas a cada 3 rodadas
- Sequência de ataques: Garra (6) → Fogo (8) → Cauda (4)
- Recompensa: 100 ouro + fim do jogo

### 🎲 Mecânicas Especiais
- **Morte**: Volte ao último vilarejo, perca metade do ouro, restaure 10 PV
- **Limite de Tentativas**: 3 tentativas contra o dragão por jogador
- **Cartas na Mão**: Sempre reponha para 5 após combate
- **Eventos Aleatórios**: Armadilhas, bênçãos e encontros únicos

## Arquivos do Jogo

- `index.html` - Interface principal e estrutura HTML
- `styles.css` - Estilos visuais e animações
- `game.js` - Lógica completa do jogo
- `README.md` - Este arquivo de instruções

## Requisitos Técnicos

- **Navegador**: Chrome, Firefox, Safari, Edge (versões recentes)
- **JavaScript**: Habilitado
- **Resolução**: Recomendado 1024x768 ou superior
- **Internet**: Não necessária após download (fontes Google Fonts opcionais)

## Executando o Jogo

### Método 1: Navegador Local
1. Baixe todos os arquivos para uma pasta
2. Abra `index.html` em qualquer navegador
3. Comece a jogar!

### Método 2: Servidor Web Local
```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (npx)
npx serve .

# Com PHP
php -S localhost:8000
```
Acesse `http://localhost:8000`

### Método 3: GitHub Pages

Acesse `https://celsodamesjunior.github.io/warrior-quest/`

## Conversão para Aplicativo Desktop

### Usando Electron:
```bash
npm install -g electron
# Criar estrutura Electron e executar
electron .
```

### Usando Tauri:
```bash
# Para desenvolvedores Rust
cargo install tauri-cli
tauri init
tauri dev
tauri build
```

## Personalização

O jogo é altamente personalizável:

- **Modifique `game.js`** para alterar regras, adicionar monstros ou eventos
- **Edite `styles.css`** para mudar temas e cores
- **Adicione novos tipos de casa** no método `initializeBoard()`
- **Crie novos monstros** em `initializeMonsterDeck()`
- **Implemente eventos únicos** em `initializeEventDeck()`

## Licença

Este projeto é livre para uso pessoal e educacional. Sinta-se à vontade para modificar e distribuir.

---

**"A jornada de um herói não é medida apenas pela distância percorrida, mas pelo peso do ouro em sua bolsa e pelas cicatrizes de suas batalhas."**

*Que sua aventura seja épica! 🗡️🛡️🐉*
