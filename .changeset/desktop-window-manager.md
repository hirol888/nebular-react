---
'@nebular-react/core': minor
'@nebular-react/styles': minor
---

Adiciona `Desktop`, um gerenciador de janelas em tela cheia com taskbar em qualquer borda,
menu Iniciar de apps, janelas arrastáveis/redimensionáveis, minimizar/maximizar/restaurar,
sobreposição por z-index, relógio e área de status. Janelas filhas podem ser independentes
ou modais, bloqueando a janela-mãe com backdrop, `inert` e focus trap; `useDesktop()` e
`useDesktopWindow()` expõem as ações de abertura, foco e fechamento.

Inclui snap para bordas e cantos com preview, navegação por teclado na taskbar e no menu
Iniciar, `Alt+Tab`, anúncios `aria-live`, persistência de layout via `storageKey` (incluindo
área de trabalho ativa), agrupamento de janelas no taskbar com overflow, menu de contexto,
busca/fixados/recentes no menu Iniciar, áreas de trabalho virtuais, layout compacto
responsivo, `alwaysOnTop`, `skipTaskbar`, `centerOnOpen`, `keepInBounds`, callbacks de ciclo
de vida e `prefers-reduced-motion`. Janelas minimizadas ou em outra área de trabalho
permanecem montadas com o estado do conteúdo preservado.

Title bar, menu Iniciar e taskbar compartilham o mesmo título e ícone do app; janelas avulsas
aceitam `title` e `icon` próprios. O catálogo i18n ganhou as chaves `desktop.*` e o pacote de
ícones essenciais ganhou `menu-outline` e `more-horizontal-outline`.
