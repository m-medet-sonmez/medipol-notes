import { Resend } from 'resend';

const resend = new Resend('re_cD5MpMwk_CCsqDzHPogVYTPFB5xPh9Ezg');

resend.emails.list()
    .then(res => {
        if (res.data && res.data.data) {
            console.log(res.data.data.map(e => ({ to: e.to, status: e.status, created_at: e.created_at })));
        } else {
            console.log(res);
        }
    })
    .catch(console.error);
