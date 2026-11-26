---
'@nebular-react/core': minor
'@nebular-react/styles': minor
---

Adiciona `Desktop`, um gerenciador de janelas em tela cheia com taskbar em qualquer borda,
menu Iniciar, janelas arrastáveis/redimensionáveis, minimizar/maximizar/restaurar,
sobreposição por z-index, relógio e área de status. Janelas filhas podem ser independentes
ou modais, bloqueando a janela-mãe com backdrop, `inert` e focus trap; `useDesktop()` e
`useDesktopWindow()` expõem as ações de abertura, foco e fechamento.

Inclui snap para bordas e cantos com preview, snap layouts no menu de contexto, navegação
por teclado na taskbar e no menu Iniciar, `Alt+Tab`, anúncios `aria-live`, persistência de
layout via `storageKey` ou `layoutAdapter` assíncrono (incluindo área de trabalho ativa e
estado JSON por janela com `useDesktopWindowState`), escopo por Profile/Tenant/App/Device,
`createBroadcastLayoutAdapter` para sincronização entre abas/surfaces, `getDesktopDeviceId`, agrupamento de janelas no taskbar com
overflow, menu de contexto, busca/fixados/recentes no menu Iniciar, áreas de trabalho
virtuais com tema, layout compacto responsivo, `alwaysOnTop`, `skipTaskbar`, `centerOnOpen`,
`keepInBounds`, callbacks de ciclo de vida e `prefers-reduced-motion`. Janelas minimizadas
ou em outra área de trabalho permanecem montadas com o estado do conteúdo preservado.

Adiciona suporte a múltiplos monitores no modo `displayMode="span"` com zonas de display,
snap/maximize por monitor, `moveWindowToDisplay` e o hook `useDesktopDisplays` (Window
Management API com fallback para display único). Também entram ícones no wallpaper,
command palette (`Ctrl/Cmd+K`), visão geral, `NotificationCenter` na taskbar, error boundary
por janela, associação de arquivos (`fileExtensions`/`openFile`) e reabertura de janelas
fechadas.

Adiciona `FileExplorer`, uma evolução do `FileManager` orientada a um `FileSystemProvider`
assíncrono, com providers em memória e REST, navegação back/forward/up, breadcrumb, busca,
views list/grid/details, seleção múltipla, teclado, copiar/cortar/colar, arrastar para pasta,
abas, renomear, excluir, criar pasta, upload
por input/drag-and-drop, preview e sidebar.

O catálogo i18n ganhou as chaves `desktop.*` e `fileExplorer.*`; o pacote de ícones
essenciais ganhou `menu-outline`, `more-horizontal-outline`, `folder-outline` e
`refresh-outline`.
