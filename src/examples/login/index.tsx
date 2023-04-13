import { Avatar, Button, Card, Dialog, Stack, Typography } from '@mui/material';
import connectMetamask from 'src/auth/connectMetamask';
import { useEffect, useState } from 'react';
import SvgIcon from 'src/components/svg-Icon';
import { fetchGet, fetchPost } from 'src/utils/fetch';
import { toast } from 'react-toastify';
import { bc_auth } from 'src/auth/AuthPage';
import UnsignUserDialog from './UnsignUserDialog';

export const BACKEND_API = 'https://api-dev.carv.io';

const OneClickLogin = () => {
  const [profile, setProfile] = useState<any>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  console.log('profile:', profile);

  useEffect(() => {
    bc_auth.onmessage = async function (e) {
      const res = e.data;
      console.log('res:', res);
      if (res.code === 0) {
        const token = res.data.token;

        if (token) {
          fetchGet(`${BACKEND_API}/users/profile?user_id=me`, {
            headers: {
              authorization: token,
            },
          }).then(profile => {
            setProfile(profile);
          });
        } else {
          toast.error('Token is empty');
        }
      } else if (res.code === 2040) {
        const client_id = res.data.client_id;
        if (client_id) {
          setClientId(client_id);
        } else {
          toast.error('client_id is empty');
        }
      } else {
        toast.error(res.msg);
      }
    };
    return () => {
      bc_auth.onmessage = null;
    };
  }, []);

  const carvLogin = async () => {
    const loginParams = await connectMetamask();

    fetchPost<any>(`${BACKEND_API}/auth/login`, loginParams)
      .then(res => {
        if (res.code === 0) {
          fetchGet(`${BACKEND_API}/users/profile?user_id=me`, {
            headers: {
              authorization: res.data.token,
            },
          }).then(profile => {
            setProfile(profile);
          });
        } else {
          toast.error(res.msg);
        }
      })
      .finally(onClose);
  };
  const onClose = () => {
    setOpen(false);
  };

  const list = [
    {
      label: 'user_id',
      value: profile?.user_id || '',
    },
    {
      label: 'twitter_nickname',
      value: profile?.twitter?.name || '',
    },
    {
      label: 'discord_nickname',
      value: profile?.discord?.username || '',
    },
  ];

  const twitterLogin = async () => {
    const openLink = await fetchGet(
      `${BACKEND_API}/community/twitter/login/authorization?redirect=${location.origin}/auth`
    );
    setOpen(false);
    window.open(
      openLink as string,
      'intent',
      `resizable=yes,toolbar=no,location=yes,width=600,height=760,left=50,top=50`
    );
  };
  // const discordLogin = async () => {
  //   const openLink = await fetchGet(
  //     `${BACKEND_API}/community/twitter/login/authorization?redirect=${location.origin}/auth`
  //   );
  //   setOpen(false);
  //   window.open(
  //     openLink as string,
  //     'intent',
  //     `resizable=yes,toolbar=no,location=yes,width=600,height=760,left=50,top=50`
  //   );
  // };

  const onUnsignUserDialogClose = () => {
    setClientId(null);
  };
  return (
    <>
      <UnsignUserDialog
        clientId={clientId}
        onClose={onUnsignUserDialogClose}
        setProfile={setProfile}
      />
      <Stack sx={{ mt: 5 }}>
        {profile ? (
          <>
            <Stack flexDirection={'row'} alignItems={'center'}>
              <Avatar src={profile?.avatar} />
              <Stack sx={{ ml: 1 }}>
                <Typography variant="subtitle2">
                  {profile?.unique_nickname}
                </Typography>
              </Stack>
            </Stack>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {list.map(item => {
                return (
                  <Stack
                    key={item.value}
                    flexDirection={'row'}
                    alignItems={'center'}
                    gap={2}
                  >
                    <Typography variant="subtitle1" color={'grey.500'}>
                      {item.label}
                    </Typography>
                    <Typography variant="body1">{item.value}</Typography>
                  </Stack>
                );
              })}
            </Stack>
            <Button
              variant="contained"
              sx={{
                mt: 3,
                textTransform: 'capitalize',
                color: 'grey.50',
              }}
              onClick={() => {
                setProfile(null);
              }}
            >
              Log out
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            sx={{
              mt: 3,
              textTransform: 'capitalize',
              color: 'grey.50',
            }}
            onClick={() => {
              setOpen(true);
            }}
          >
            login
          </Button>
        )}
      </Stack>
      <Dialog open={open} onClose={onClose}>
        <Card sx={{ p: 3, width: 280 }}>
          <Typography variant="h5">Log in</Typography>
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button
              startIcon={<SvgIcon icon="svg-metamask" />}
              onClick={carvLogin}
              variant="outlined"
              sx={{
                textTransform: 'capitalize',
                color: 'grey.50',
              }}
            >
              Wallet login
            </Button>
            <Button
              startIcon={<SvgIcon icon="svg-twitter" />}
              onClick={twitterLogin}
              variant="outlined"
              sx={{
                textTransform: 'capitalize',
                color: 'grey.50',
              }}
            >
              Twitter login
            </Button>
            {/* <Button
              startIcon={<SvgIcon icon="svg-discord" />}
              // onClick={discordLogin}
              variant="outlined"
              sx={{
                textTransform: 'capitalize',
                color: 'grey.50',
              }}
            >
              Discord login
            </Button> */}
          </Stack>
        </Card>
      </Dialog>
    </>
  );
};

export default OneClickLogin;
