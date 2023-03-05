import React, { useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import { ControlStatusExample, ExampleItemsCol } from '../Shared';
import { Button } from '../Button';
import { ButtonGroup } from './ButtonGroup';

export default { title: 'ButtonGroup' };

const createStoryStyles = createStyles(() => ({
  text: {
    margin: '1rem 0 0',
    lineHeight: '1.5rem'
  },
  italic: {
    fontStyle: 'italic'
  },
  underline: {
    textDecoration: 'underline'
  },
  bold: {
    fontWeight: 'bold'
  }
}));

export function Showcase() {
  const { classes, cx } = createStoryStyles();
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['italic']);

  return (
    <>
      <ButtonGroup<true>
        multiple
        pressedStatus="primary"
        pressed={selectedClasses}
        onChange={(values) => setSelectedClasses(values)}
      >
        <ButtonGroup.Toogle
          pressed={selectedClasses.includes('bold')}
          value="bold"
          className={cx(classes.bold)}
        >
          Bold
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle
          pressed={selectedClasses.includes('italic')}
          value="italic"
          className={cx(classes.italic)}
        >
          Italic
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle
          pressed={selectedClasses.includes('underline')}
          value="underline"
          className={cx(classes.underline)}
        >
          Underline
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <p className={cx(classes.text, selectedClasses)}>
        A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
      </p>
    </>
  );
}

export function ButtonAndButtonToggleGroup() {
  const [pressed, setPressed] = useState<string[]>(['a']);

  return (
    <>
      <p>A group of buttons</p>
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
        <Button>C</Button>
        <Button>D</Button>
        <Button>E</Button>
      </ButtonGroup>

      <p>A group of button toggles</p>
      <ButtonGroup<true>
        multiple
        pressedStatus="primary"
        pressed={pressed}
        onChange={(values) => setPressed(values)}
      >
        <ButtonGroup.Toogle value="a" pressed={pressed.includes('a')}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="b" pressed={pressed.includes('b')}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="c" pressed={pressed.includes('c')}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="d" pressed={pressed.includes('d')}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="e" pressed={pressed.includes('e')}>
          E
        </ButtonGroup.Toogle>
      </ButtonGroup>
    </>
  );
}

export function Appearance() {
  const [filledPressed, setFilledPressed] = useState<string>(null);
  const [outlinePressed, setOutlinePressed] = useState<string>(null);
  const [ghostPressed, setGhostPressed] = useState<string>(null);

  return (
    <ExampleItemsCol>
      <ButtonGroup<false>
        appearance="filled"
        pressedStatus="primary"
        onChange={(value) => setFilledPressed(value)}
      >
        <ButtonGroup.Toogle value="fa" pressed={filledPressed === 'fa'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="fb" pressed={filledPressed === 'fb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="fc" pressed={filledPressed === 'fc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="fd" pressed={filledPressed === 'fd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="fe" pressed={filledPressed === 'fe'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ff" pressed={filledPressed === 'ff'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        appearance="outline"
        pressedStatus="primary"
        onChange={(value) => setOutlinePressed(value)}
      >
        <ButtonGroup.Toogle value="oa" pressed={outlinePressed === 'oa'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ob" pressed={outlinePressed === 'ob'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="oc" pressed={outlinePressed === 'oc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="od" pressed={outlinePressed === 'od'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="oe" pressed={outlinePressed === 'oe'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="of" pressed={outlinePressed === 'of'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        appearance="ghost"
        pressedStatus="primary"
        onChange={(value) => setGhostPressed(value)}
      >
        <ButtonGroup.Toogle value="ga" pressed={ghostPressed === 'ga'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gb" pressed={ghostPressed === 'gb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gc" pressed={ghostPressed === 'gc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gd" pressed={ghostPressed === 'gd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ge" pressed={ghostPressed === 'ge'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gf" pressed={ghostPressed === 'gf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
    </ExampleItemsCol>
  );
}

export function Disabled() {
  return (
    <ButtonGroup disabled>
      <ButtonGroup.Toogle value="a">A</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="b">B</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="c">C</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="d">D</ButtonGroup.Toogle>
      <ButtonGroup.Toogle value="e">E</ButtonGroup.Toogle>
    </ButtonGroup>
  );
}

export function Shape() {
  const [rectanglePressed, setRectanglePressed] = useState<string>(null);
  const [semiroundPressed, setSemiroundPressed] = useState<string>(null);
  const [roundPressed, setRoundPressed] = useState<string>(null);

  return (
    <ExampleItemsCol>
      <ButtonGroup<false>
        shape="rectangle"
        pressedStatus="primary"
        onChange={(value) => setRectanglePressed(value)}
      >
        <ButtonGroup.Toogle value="ta" pressed={rectanglePressed === 'ta'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="tb" pressed={rectanglePressed === 'tb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="tc" pressed={rectanglePressed === 'tc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="td" pressed={rectanglePressed === 'td'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="te" pressed={rectanglePressed === 'te'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="tf" pressed={rectanglePressed === 'tf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        shape="semiround"
        pressedStatus="primary"
        onChange={(value) => setSemiroundPressed(value)}
      >
        <ButtonGroup.Toogle value="sa" pressed={semiroundPressed === 'sa'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sb" pressed={semiroundPressed === 'sb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sc" pressed={semiroundPressed === 'sc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sd" pressed={semiroundPressed === 'sd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="se" pressed={semiroundPressed === 'se'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sf" pressed={semiroundPressed === 'sf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        shape="round"
        pressedStatus="primary"
        onChange={(value) => setRoundPressed(value)}
      >
        <ButtonGroup.Toogle value="ra" pressed={roundPressed === 'ra'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="rb" pressed={roundPressed === 'rb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="rc" pressed={roundPressed === 'rc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="rd" pressed={roundPressed === 'rd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="re" pressed={roundPressed === 're'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="rf" pressed={roundPressed === 'rf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
    </ExampleItemsCol>
  );
}

export function Size() {
  const [tinyPressed, setTinyPressed] = useState<string>(null);
  const [smallPessed, setSmallPressed] = useState<string>(null);
  const [mediumPressed, setMeidumPressed] = useState<string>(null);
  const [largePressed, setLargePressed] = useState<string>(null);
  const [giantPressed, setGiantPressed] = useState<string>(null);

  return (
    <ExampleItemsCol>
      <ButtonGroup<false>
        size="tiny"
        pressedStatus="primary"
        onChange={(value) => setTinyPressed(value)}
      >
        <ButtonGroup.Toogle value="ta" pressed={tinyPressed === 'ta'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="tb" pressed={tinyPressed === 'tb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="tc" pressed={tinyPressed === 'tc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="td" pressed={tinyPressed === 'td'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="te" pressed={tinyPressed === 'te'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="tf" pressed={tinyPressed === 'tf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        size="small"
        pressedStatus="primary"
        onChange={(value) => setSmallPressed(value)}
      >
        <ButtonGroup.Toogle value="sa" pressed={smallPessed === 'sa'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sb" pressed={smallPessed === 'sb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sc" pressed={smallPessed === 'sc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sd" pressed={smallPessed === 'sd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="se" pressed={smallPessed === 'se'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sf" pressed={smallPessed === 'sf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        size="medium"
        pressedStatus="primary"
        onChange={(value) => setMeidumPressed(value)}
      >
        <ButtonGroup.Toogle value="ma" pressed={mediumPressed === 'ma'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="mb" pressed={mediumPressed === 'mb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="mc" pressed={mediumPressed === 'mc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="md" pressed={mediumPressed === 'md'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="me" pressed={mediumPressed === 'me'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="mf" pressed={mediumPressed === 'mf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        size="large"
        pressedStatus="primary"
        onChange={(value) => setLargePressed(value)}
      >
        <ButtonGroup.Toogle value="la" pressed={largePressed === 'la'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="lb" pressed={largePressed === 'lb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="lc" pressed={largePressed === 'lc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ld" pressed={largePressed === 'ld'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="le" pressed={largePressed === 'le'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="lf" pressed={largePressed === 'lf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        size="giant"
        pressedStatus="primary"
        onChange={(value) => setGiantPressed(value)}
      >
        <ButtonGroup.Toogle value="ga" pressed={giantPressed === 'ga'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gb" pressed={giantPressed === 'gb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gc" pressed={giantPressed === 'gc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gd" pressed={giantPressed === 'gd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ge" pressed={giantPressed === 'ge'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="gf" pressed={giantPressed === 'gf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
    </ExampleItemsCol>
  );
}

export function Status() {
  const [basicPressed, setBasicPressed] = useState<string>(null);
  const [primaryPessed, setPrimaryPressed] = useState<string>(null);
  const [successPressed, setSuccessPressed] = useState<string>(null);
  const [infoPressed, setInfoPressed] = useState<string>(null);
  const [warningPressed, setWarningPressed] = useState<string>(null);
  const [dangerPressed, setDangerPressed] = useState<string>(null);
  const [controlPressed, setControlPressed] = useState<string>(null);

  return (
    <ExampleItemsCol>
      <ButtonGroup<false>
        pressedStatus="primary"
        notPressedStatus="basic"
        onChange={(value) => setBasicPressed(value)}
      >
        <ButtonGroup.Toogle value="ba" pressed={basicPressed === 'ba'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="bb" pressed={basicPressed === 'bb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="bc" pressed={basicPressed === 'bc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="bd" pressed={basicPressed === 'bd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="be" pressed={basicPressed === 'be'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="bf" pressed={basicPressed === 'bf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        pressedStatus="primary"
        notPressedStatus="info"
        onChange={(value) => setPrimaryPressed(value)}
      >
        <ButtonGroup.Toogle value="pa" pressed={primaryPessed === 'pa'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="pb" pressed={primaryPessed === 'pb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="pc" pressed={primaryPessed === 'pc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="pd" pressed={primaryPessed === 'pd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="pe" pressed={primaryPessed === 'pe'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="pf" pressed={primaryPessed === 'pf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        pressedStatus="success"
        notPressedStatus="danger"
        onChange={(value) => setSuccessPressed(value)}
      >
        <ButtonGroup.Toogle value="sa" pressed={successPressed === 'sa'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sb" pressed={successPressed === 'sb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sc" pressed={successPressed === 'sc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sd" pressed={successPressed === 'sd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="se" pressed={successPressed === 'se'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="sf" pressed={successPressed === 'sf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        pressedStatus="info"
        notPressedStatus="basic"
        onChange={(value) => setInfoPressed(value)}
      >
        <ButtonGroup.Toogle value="ia" pressed={infoPressed === 'ia'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ib" pressed={infoPressed === 'ib'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ic" pressed={infoPressed === 'ic'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="id" pressed={infoPressed === 'id'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="ie" pressed={infoPressed === 'ie'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="if" pressed={infoPressed === 'if'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        pressedStatus="warning"
        notPressedStatus="success"
        onChange={(value) => setWarningPressed(value)}
      >
        <ButtonGroup.Toogle value="wa" pressed={warningPressed === 'wa'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="wb" pressed={warningPressed === 'wb'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="wc" pressed={warningPressed === 'wc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="wd" pressed={warningPressed === 'wd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="we" pressed={warningPressed === 'we'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="wf" pressed={warningPressed === 'wf'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ButtonGroup<false>
        pressedStatus="danger"
        notPressedStatus="danger"
        onChange={(value) => setDangerPressed(value)}
      >
        <ButtonGroup.Toogle value="da" pressed={dangerPressed === 'da'}>
          A
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="db" pressed={dangerPressed === 'db'}>
          B
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="dc" pressed={dangerPressed === 'dc'}>
          C
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="dd" pressed={dangerPressed === 'dd'}>
          D
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="de" pressed={dangerPressed === 'de'}>
          E
        </ButtonGroup.Toogle>
        <ButtonGroup.Toogle value="df" pressed={dangerPressed === 'df'}>
          F
        </ButtonGroup.Toogle>
      </ButtonGroup>
      <ControlStatusExample>
        <ButtonGroup<false>
          pressedStatus="control"
          notPressedStatus="basic"
          onChange={(value) => setControlPressed(value)}
        >
          <ButtonGroup.Toogle value="ca" pressed={controlPressed === 'ca'}>
            A
          </ButtonGroup.Toogle>
          <ButtonGroup.Toogle value="cb" pressed={controlPressed === 'cb'}>
            B
          </ButtonGroup.Toogle>
          <ButtonGroup.Toogle value="cc" pressed={controlPressed === 'cc'}>
            C
          </ButtonGroup.Toogle>
          <ButtonGroup.Toogle value="cd" pressed={controlPressed === 'cd'}>
            D
          </ButtonGroup.Toogle>
          <ButtonGroup.Toogle value="ce" pressed={controlPressed === 'ce'}>
            E
          </ButtonGroup.Toogle>
          <ButtonGroup.Toogle value="cf" pressed={controlPressed === 'cf'}>
            F
          </ButtonGroup.Toogle>
        </ButtonGroup>
      </ControlStatusExample>
    </ExampleItemsCol>
  );
}
