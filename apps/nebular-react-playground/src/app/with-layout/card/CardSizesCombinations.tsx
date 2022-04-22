import React from 'react';
import { NbCard, NbCardHeader } from '@nebular-react';
import './CardSizesCombinations.scoped.scss';

const CardSizesCombinations: React.FC = () => {
  return (
    <div className="cards-container">
      <div className="card-row">
        <div className="card-col">
          <NbCard size="tiny">
            <NbCardHeader>Tiny card</NbCardHeader>
          </NbCard>
          <NbCard size="tiny">
            <NbCardHeader>Tiny card</NbCardHeader>
          </NbCard>
        </div>
        <div className="card-col">
          <NbCard size="medium">
            <NbCardHeader>Medium card</NbCardHeader>
          </NbCard>
        </div>
      </div>

      <div className="card-row">
        <div className="card-col">
          <NbCard size="tiny">
            <NbCardHeader>Tiny card</NbCardHeader>
          </NbCard>
          <NbCard size="small">
            <NbCardHeader>Small card</NbCardHeader>
          </NbCard>
        </div>
        <div className="card-col">
          <NbCard size="large">
            <NbCardHeader>Large card</NbCardHeader>
          </NbCard>
        </div>
      </div>

      <div className="card-row">
        <div className="card-col">
          <NbCard size="tiny">
            <NbCardHeader>Tiny card</NbCardHeader>
          </NbCard>
          <NbCard size="medium">
            <NbCardHeader>Medium card</NbCardHeader>
          </NbCard>
        </div>
        <div className="card-col">
          <NbCard size="giant">
            <NbCardHeader>Giant card</NbCardHeader>
          </NbCard>
        </div>
      </div>

      <div className="card-row">
        <div className="card-col">
          <NbCard size="tiny">
            <NbCardHeader>Tiny card</NbCardHeader>
          </NbCard>
          <NbCard size="tiny">
            <NbCardHeader>Tiny card</NbCardHeader>
          </NbCard>
          <NbCard size="tiny">
            <NbCardHeader>Tiny card</NbCardHeader>
          </NbCard>
        </div>
        <div className="card-col">
          <NbCard size="giant">
            <NbCardHeader>Giant card</NbCardHeader>
          </NbCard>
        </div>
      </div>

      <div className="card-row">
        <div className="card-col">
          <NbCard size="small">
            <NbCardHeader>Small card</NbCardHeader>
          </NbCard>
          <NbCard size="small">
            <NbCardHeader>Small card</NbCardHeader>
          </NbCard>
        </div>
        <div className="card-col">
          <NbCard size="giant">
            <NbCardHeader>Giant card</NbCardHeader>
          </NbCard>
        </div>
      </div>
    </div>
  );
};

export default CardSizesCombinations;
