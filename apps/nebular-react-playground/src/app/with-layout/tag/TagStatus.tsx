import { NbCard, NbCardBody, NbTagList, NbTag } from '@nebular-react';

export function TagStatus() {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbTagList>
          <NbTag status="basic" appearance="filled" text="basic"></NbTag>
          <NbTag status="primary" appearance="filled" text="primary"></NbTag>
          <NbTag status="success" appearance="filled" text="success"></NbTag>
          <NbTag status="info" appearance="filled" text="info"></NbTag>
          <NbTag status="warning" appearance="filled" text="warning"></NbTag>
          <NbTag status="danger" appearance="filled" text="danger"></NbTag>
        </NbTagList>
        <NbTagList>
          <NbTag status="basic" appearance="outline" text="basic"></NbTag>
          <NbTag status="primary" appearance="outline" text="primary"></NbTag>
          <NbTag status="success" appearance="outline" text="success"></NbTag>
          <NbTag status="info" appearance="outline" text="info"></NbTag>
          <NbTag status="warning" appearance="outline" text="warning"></NbTag>
          <NbTag status="danger" appearance="outline" text="danger"></NbTag>
        </NbTagList>
      </NbCardBody>
    </NbCard>
  );
}
