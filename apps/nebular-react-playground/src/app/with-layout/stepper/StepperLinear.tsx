import { NbButton, NbCard, NbCardBody, NbInput, NbStep, NbStepHeader, NbStepper } from '@nebular-react';
import { Formik, FormikErrors } from 'formik';
import { NbStepperRef } from 'libs/nebular-react/src/theme/components/stepper/model';
import { useRef, useState } from 'react';

export function StepperLinear() {
  const stepperRef = useRef<NbStepperRef>(null);
  const [linearMode, setLinearMode] = useState<boolean>(true);

  const toggleLinearMode = () => {
    setLinearMode(!linearMode);
  };

  const next = () => {
    stepperRef.current?.next();
  };

  const nameFormRef = useRef<HTMLFormElement>(null);
  const movieFormRef = useRef<HTMLFormElement>(null);
  const somethingFormRef = useRef<HTMLFormElement>(null);

  return (
    <NbCard>
      <NbCardBody>
        <NbButton className="linear-mode-button" onClick={toggleLinearMode}>
          {linearMode ? 'Disable' : 'Enable'} linear mode
        </NbButton>
        <NbStepper linear={linearMode} ref={stepperRef}>
          <NbStep formRef={nameFormRef}>
            <NbStepHeader>Name</NbStepHeader>
            <Formik
              initialValues={{ name: '' }}
              initialErrors={{ name: 'Required' }}
              enableReinitialize
              validate={(values) => {
                const errors: FormikErrors<{ name: string }> = {};
                if (!values.name) {
                  errors.name = 'Required';
                }

                return errors;
              }}
              onSubmit={next}
              validateOnChange
            >
              {({ values, errors, handleChange, handleSubmit }) => (
                <form className="step-container" noValidate onSubmit={handleSubmit} ref={nameFormRef}>
                  <div className="input-group">
                    <NbInput
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      className="form-control"
                      onChange={handleChange}
                      value={values.name}
                      status={errors.name ? 'danger' : 'basic'}
                      required
                    />
                  </div>
                  <NbButton type="submit">next</NbButton>
                </form>
              )}
            </Formik>
          </NbStep>
          <NbStep formRef={movieFormRef}>
            <NbStepHeader>Movie</NbStepHeader>
            <Formik
              initialValues={{ movie: '' }}
              initialErrors={{ movie: 'Required' }}
              enableReinitialize
              validate={(values) => {
                const errors: FormikErrors<{ movie: string }> = {};
                if (!values.movie) {
                  errors.movie = 'Required';
                }

                return errors;
              }}
              onSubmit={next}
              validateOnChange
            >
              {({ values, errors, handleChange, handleSubmit }) => (
                <form className="step-container" noValidate onSubmit={handleSubmit} ref={movieFormRef}>
                  <div className="input-group">
                    <NbInput
                      type="text"
                      name="movie"
                      placeholder="Enter your favorite movie"
                      className="form-control"
                      onChange={handleChange}
                      value={values.movie}
                      status={errors.movie ? 'danger' : 'basic'}
                      required
                    />
                  </div>
                  <NbButton type="submit">next</NbButton>
                </form>
              )}
            </Formik>
          </NbStep>
          <NbStep formRef={somethingFormRef}>
            <NbStepHeader>Something</NbStepHeader>
            <Formik
              initialValues={{ something: '' }}
              initialErrors={{ something: 'Required' }}
              enableReinitialize
              validate={(values) => {
                const errors: FormikErrors<{ something: string }> = {};
                if (!values.something) {
                  errors.something = 'Required';
                }

                return errors;
              }}
              onSubmit={next}
              validateOnChange
            >
              {({ values, errors, handleChange, handleSubmit }) => (
                <form className="step-container" noValidate onSubmit={handleSubmit} ref={somethingFormRef}>
                  <div className="input-group">
                    <NbInput
                      type="text"
                      name="something"
                      placeholder="Enter something"
                      className="form-control"
                      onChange={handleChange}
                      value={values.something}
                      status={errors.something ? 'danger' : 'basic'}
                      required
                    />
                  </div>
                </form>
              )}
            </Formik>
          </NbStep>
          <NbStep hidden>
            <div className="step-container">
              <h3>Wizard completed!</h3>
              <NbButton>Try again</NbButton>
            </div>
          </NbStep>
        </NbStepper>
      </NbCardBody>
    </NbCard>
  );
}
