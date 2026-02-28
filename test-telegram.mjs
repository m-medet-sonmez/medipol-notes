const botToken = '8241819879:AAFc-2j0tN3IIxhe6VZb6toC8W_BeS6LJ54';
const chatId = '5368917549';

const telegramApiUrl = 'https://api.telegram.org/bot' + botToken + '/sendMessage';

fetch(telegramApiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        chat_id: chatId,
        text: '🔔 *TEST MESAJI* \nEger bunu aldiysaniz bot calisiyor demektir.',
        parse_mode: 'Markdown',
    }),
})
    .then(res => res.json())
    .then(data => {
        console.log('TELEGRAM CEVABI:', data);
    })
    .catch(err => {
        console.error('HATA:', err);
    });
