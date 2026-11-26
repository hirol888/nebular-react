---
'@nebular-react/core': patch
---

Permite usar `MenuItem` como ação com `component` customizado e `onClick`, sem `to`/`href`. O item passa a renderizar o componente informado, mantém a seleção do menu e chama o `onClick` do consumidor; itens com link também executam a seleção antes do handler customizado.
