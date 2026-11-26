---
'@nebular-react/core': minor
---

Adiciona `Desktop`, um gerenciador de janelas em tela cheia com taskbar em qualquer borda,
menu Iniciar de apps, janelas arrastáveis/redimensionáveis, minimizar/maximizar/restaurar,
sobreposição por z-index, relógio e área de status. Janelas filhas podem ser independentes
ou modais, bloqueando a janela-mãe com backdrop e `inert`; `useDesktop()` e
`useDesktopWindow()` expõem as ações de abertura, foco e fechamento. Title bar, menu Iniciar
e taskbar compartilham o mesmo título e ícone do app; janelas avulsas aceitam `title` e
`icon` próprios.
