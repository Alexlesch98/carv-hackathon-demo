import { useLocation } from 'react-router-dom';

const auth_channel = new BroadcastChannel('auth');

const AuthPage = () => {
  const l = useLocation();
  const search = l.search;

  const sp = new URLSearchParams(search);
  const token = sp.get('token');
  const code = sp.get('code');
  const msg = sp.get('msg');
  const client_id = sp.get('client_id');

  const data = {
    code: code ? Number(code) : -1,
    data: {
      token,
      client_id,
    },
    msg,
  };

  // auth_channel.postMessage(data);

  setTimeout(() => {
    const event = new CustomEvent('carvOauthResponse', {
      detail: data,
    });
    document.dispatchEvent(event);
  }, 1000);

  // window.close();

  return <div></div>;
};

export default AuthPage;
