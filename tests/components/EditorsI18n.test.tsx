import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import { MarkdownEditor, RichTextEditor } from '@nebular-react/core';

describe('Editors i18n', () => {
  describe('RichTextEditor', () => {
    it('RichTextEditor_Default_ShouldRenderEnglishToolbarAndFindDialog', () => {
      render(<RichTextEditor defaultValue="<p>alpha beta alpha</p>" />);

      expect(screen.getByRole('textbox', { name: 'Rich text editor' })).toBeInTheDocument();
      expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeInTheDocument();

      ['Bold', 'Italic', 'Underline', 'Strike through', 'Inline code', 'Code block'].forEach(
        (name) => {
          expect(screen.getByRole('button', { name })).toBeInTheDocument();
        }
      );

      fireEvent.click(screen.getByRole('button', { name: 'Find and replace' }));

      expect(screen.getByRole('dialog', { name: 'Find and replace' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Find…')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Replace with…')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Match case' })).toBeInTheDocument();

      fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), {
        target: { value: 'alpha' }
      });

      expect(screen.getByRole('status')).toHaveTextContent('1 of 2');
      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Replace all' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('RichTextEditor_ProviderPtBr_ShouldTranslateToolbarAndDialogs', async () => {
      const user = userEvent.setup();

      render(
        <NebularProvider locale="pt-BR">
          <RichTextEditor defaultValue="<p>alpha beta alpha</p>" />
        </NebularProvider>
      );

      expect(screen.getByRole('textbox', { name: 'Editor de texto' })).toBeInTheDocument();
      expect(screen.getByRole('toolbar', { name: 'Formatação' })).toBeInTheDocument();

      [
        'Negrito',
        'Itálico',
        'Sublinhado',
        'Tachado',
        'Título 1',
        'Título 2',
        'Lista com marcadores',
        'Lista numerada',
        'Alinhar à esquerda',
        'Centralizar',
        'Alinhar à direita',
        'Desfazer',
        'Refazer',
        'Limpar formatação',
        'Código inline',
        'Bloco de código',
        'Inserir tabela',
        'Adicionar linha',
        'Remover linha',
        'Adicionar coluna',
        'Remover coluna',
        'Excluir tabela',
        'Inserir imagem',
        'Inserir link'
      ].forEach((name) => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Inserir link' }));

      expect(screen.getByRole('dialog', { name: 'Inserir link' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'URL' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Inserir' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      await user.click(screen.getByRole('button', { name: 'Localizar e substituir' }));

      expect(screen.getByRole('dialog', { name: 'Localizar e substituir' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Localizar…')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Substituir por…')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Diferenciar maiúsculas' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Próximo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Substituir todos' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    });

    it('RichTextEditor_Labels_ShouldOverrideProviderAndLoseToLegacyAriaProps', () => {
      const { rerender } = render(
        <NebularProvider locale="pt-BR">
          <RichTextEditor
            labels={{
              editorLabel: 'Editor custom',
              formatting: 'Barra custom',
              bold: 'Negrito custom',
              find: 'Buscar e substituir'
            }}
          />
        </NebularProvider>
      );

      expect(screen.getByRole('textbox', { name: 'Editor custom' })).toBeInTheDocument();
      expect(screen.getByRole('toolbar', { name: 'Barra custom' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Negrito custom' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Inserir link' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Buscar e substituir' }));

      expect(screen.getByRole('dialog', { name: 'Buscar e substituir' })).toBeInTheDocument();

      rerender(
        <NebularProvider locale="pt-BR">
          <RichTextEditor
            ariaLabel="Conteúdo"
            toolbarAriaLabel="Formatação custom"
            labels={{
              editorLabel: 'Editor custom',
              formatting: 'Barra custom',
              bold: 'Negrito custom'
            }}
          />
        </NebularProvider>
      );

      expect(screen.getByRole('textbox', { name: 'Conteúdo' })).toBeInTheDocument();
      expect(screen.getByRole('toolbar', { name: 'Formatação custom' })).toBeInTheDocument();
    });

    it('RichTextEditor_A11y_ShouldHaveNoViolationsInPtBr', async () => {
      const { container } = render(
        <NebularProvider locale="pt-BR">
          <RichTextEditor defaultValue="<p>alpha beta</p>" />
        </NebularProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Localizar e substituir' }));

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('MarkdownEditor', () => {
    it('MarkdownEditor_Default_ShouldRenderEnglishToolbarAndModes', () => {
      render(<MarkdownEditor defaultValue="# Title" />);

      expect(screen.getByRole('textbox', { name: 'Markdown editor' })).toBeInTheDocument();
      expect(screen.getByRole('toolbar', { name: 'Markdown formatting' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Preview mode' })).toBeInTheDocument();

      [
        'Bold',
        'Italic',
        'Insert link',
        'Inline code',
        'Code block',
        'Bullet list',
        'Quote',
        'Heading'
      ].forEach((name) => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      });

      ['Edit', 'Split', 'Preview'].forEach((name) => {
        expect(screen.getByRole('radio', { name })).toBeInTheDocument();
      });

      expect(screen.getByRole('article', { name: 'Markdown editor Preview' })).toBeInTheDocument();
    });

    it('MarkdownEditor_ProviderPtBr_ShouldTranslateToolbarAndModes', async () => {
      const user = userEvent.setup();

      render(
        <NebularProvider locale="pt-BR">
          <MarkdownEditor defaultValue="# Título" ariaLabel="Notas" />
        </NebularProvider>
      );

      expect(screen.getByRole('textbox', { name: 'Notas' })).toBeInTheDocument();
      expect(screen.getByRole('toolbar', { name: 'Formatação Markdown' })).toBeInTheDocument();

      [
        'Negrito',
        'Itálico',
        'Inserir link',
        'Código inline',
        'Bloco de código',
        'Lista com marcadores',
        'Citação',
        'Título'
      ].forEach((name) => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      });

      ['Editar', 'Dividir', 'Prévia'].forEach((name) => {
        expect(screen.getByRole('radio', { name })).toBeInTheDocument();
      });

      expect(screen.getByRole('article', { name: 'Notas Prévia' })).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: 'Prévia' }));

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('article', { name: 'Notas Prévia' })).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: 'Editar' }));

      expect(screen.getByRole('textbox', { name: 'Notas' })).toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('MarkdownEditor_Labels_ShouldOverrideProvider', () => {
      render(
        <NebularProvider locale="pt-BR">
          <MarkdownEditor
            defaultValue="# Título"
            ariaLabel="Notas"
            labels={{
              bold: 'Negrito custom',
              preview: 'Visualizar',
              formatting: 'Barra custom',
              previewMode: 'Modo de visualização'
            }}
          />
        </NebularProvider>
      );

      expect(screen.getByRole('toolbar', { name: 'Barra custom' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Negrito custom' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Itálico' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Modo de visualização' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Visualizar' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Dividir' })).toBeInTheDocument();
      expect(screen.getByRole('article', { name: 'Notas Visualizar' })).toBeInTheDocument();
    });

    it('MarkdownEditor_A11y_ShouldHaveNoViolationsInPtBr', async () => {
      const { container } = render(
        <NebularProvider locale="pt-BR">
          <MarkdownEditor defaultValue="# Título" maxLength={200} ariaLabel="Notas" />
        </NebularProvider>
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
