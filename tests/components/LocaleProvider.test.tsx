import React from 'react';
import { render, screen } from '@testing-library/react';
import { NebularProvider, useNebularLocale } from '@nebular-react/styles';
import { Calendar, NumberFormatter } from '@nebular-react/core';

function LocaleProbe() {
  const { locale, t } = useNebularLocale();

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="close">{t('common.close', 'Close')}</span>
      <span data-testid="pending">{t('dataGrid.pendingChanges', '{count} pending', { count: 3 })}</span>
    </div>
  );
}

describe('Nebular locale provider', () => {
  it('falls back to en-US without a provider', () => {
    render(<LocaleProbe />);

    expect(screen.getByTestId('locale')).toHaveTextContent('en-US');
    expect(screen.getByTestId('close')).toHaveTextContent('Close');
    expect(screen.getByTestId('pending')).toHaveTextContent('3 pending');
  });

  it('uses the built-in pt-BR catalog', () => {
    render(
      <NebularProvider locale="pt-BR">
        <LocaleProbe />
      </NebularProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('pt-BR');
    expect(screen.getByTestId('close')).toHaveTextContent('Fechar');
    expect(screen.getByTestId('pending')).toHaveTextContent('3 alterações pendentes');
  });

  it('merges custom messages over the built-in catalog', () => {
    render(
      <NebularProvider
        locale="pt-BR"
        messages={{ 'common.close': 'Encerrar', 'dataGrid.pendingChanges': '{count} pendentes' }}
      >
        <LocaleProbe />
      </NebularProvider>
    );

    expect(screen.getByTestId('close')).toHaveTextContent('Encerrar');
    expect(screen.getByTestId('pending')).toHaveTextContent('3 pendentes');
  });

  it('uses the provider locale as the default for date components', () => {
    render(
      <NebularProvider locale="pt-BR">
        <Calendar date={new Date(2024, 4, 15)} visibleDate={new Date(2024, 4, 15)} />
      </NebularProvider>
    );

    expect(screen.getByText(/maio/i)).toBeInTheDocument();
  });

  it('uses the provider locale as the default for numbers', () => {
    render(
      <NebularProvider locale="pt-BR">
        <NumberFormatter value={1234.5} />
      </NebularProvider>
    );

    expect(screen.getByText('1.234,5')).toBeInTheDocument();
  });
});
