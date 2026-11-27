---
'@nebular-react/core': minor
---

O menu Iniciar do `Desktop` agora aceita `groups` (uma árvore de `DesktopAppGroup`) e
`DesktopApp.groupId`. Cada grupo abre uma caixa lateral independente no hover, clique ou
`ArrowRight`, com retorno por `ArrowLeft`/`Escape`, busca plana e fallback compacto para a
lista vertical tradicional. O painel raiz mantém o tamanho ao abrir submenus.
