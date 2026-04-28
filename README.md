# Snooker Scoreboard (Placar Interativo)

Um aplicativo de placar Web moderno desenvolvido para simular e registrar o andamento de uma partida de **Sinuca (Padrão Snooker)**. Seu design foi minuciosamente adaptado baseado nos layouts das transmissões televisivas para gerenciar pontuações individualmente através de interações ricas como arrastar-e-soltar (Drag and Drop).

## 🚀 Funcionalidades Construídas

*   **Design Auto-Escalável Perfeito**: Desenvolvido integralmente através de uma proporção `1920x1080px`, o quadro conta com um Javascript acoplado invisível que preserva o layout perfeitamente de acordo com a redimensão de qualquer monitor, operando exatamente como as *Overlay Lenses* das TVs. Totalmente construído utilizando elementos Gradientes de HTML e CSS – dependência zero de Imagens.
*   **Registros via Drag & Drop**:
    * O console divide o placar entre Azul Escuro e Laranja.
    * Todas as cores clássicas do jogo ficam separadas ao centro com seus referidos valores (Vermelho=1, Amarelo=2... Preto=7).
    * O cálculo é feito arrastando fisicamente a bola solta na direção do container do jogador.
*   **Sistema de Faltas Inteligente**:
    * Diferente das bolas numéricas, a Bola Branca com ícone de `Strike/Proibido` identifica quebra das regras.
    * Quando arrastada propositalmente para informar quem errou (Ex: solta na grade do Player 1), o componente computa de forma indireta os `7 Pontos` automáticos diretamente na barriga do Jogador Oponente!
*   **Gestão Dupla de Relógios (Timers)**: 
    * Com a soltura da primeiríssima bola num painel limpo, é ativado o fluxo em `setInterval`.
    * Há **dois relógios**: Um timer invisível para a medição da "Duração Total e Ininterrupta da Partida" no topo; e dois displays menores por trás dos nomes dos jogadores, espelhando a duração somente do "Round/Cenário corrente"
*   **Registro Histórico (Trackball)**:
    * Na barra contínua do rodapé (os trilhos paralelos), existe o print visual. Cada vez que um jogador comete encaçapada ou leva penalidade, a sua trilha salva a cor miniatural da bolinha como histórico do avanço.
*   **Manejo de Rounds**:
    * No painel de interface invisível - bem no texto de Placar de Rounds `0 x 0` no cabeçalho - cliques alternarão contabilizando Rounds vencidos. Ele imediatamente zera o Histórico das bolas, esvazia as somas e reseta os ponteiros de timer de Round voltando tudo para o 0 – mas o Tempo contínuo e o painel esquerdo permanecem!

## 📂 Arquitetura do Projeto

*   `index.html` — A raiz gráfica do app. Sem bibliotecas, apenas a fundação para estruturais HTML5 organizando Flexbox puros. Embutindo também um minúsculo roteiro de *Math.Min() Scale Resize* pro corpo e para os drops.
*   `styles.css` — Estilização, modelação de bolas gradientes via CSS puro, *Z-indexes* base, e *Shadows* texturizados. 
*   `app.js` — Cérebros da interface. Agrega as escutas (Event Listeners) das propriedades nativas HTML de `#dragstart`, `#dragover` além do cálculo aritmético para o `.dataTransfer` e funções de `setInterval`.

---
*Construído com excelência para responsividade irrestrita*
