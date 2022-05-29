import { useSearchParams } from 'react-router-dom';

export function RouteTabsetShowcaseChild1() {
  return (
    <p>
      List of <strong>users</strong>
    </p>
  );
}

export function RouteTabsetShowcaseChild2() {
  return (
    <p>
      List of <strong>orders</strong>
    </p>
  );
}

export function RouteTabsetShowcaseChild3() {
  const [params] = useSearchParams();

  return (
    <p>
      Hello world! param1: <strong>{params.get('param1')}</strong>, param2: <strong>{params.get('param2')}</strong>
    </p>
  );
}

export function RouteTabsetShowcaseChild4() {
  return (
    <p>
      List of <strong>transactions</strong>
    </p>
  );
}
