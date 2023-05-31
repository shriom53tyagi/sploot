const client = require('@sendgrid/mail');
client.setApiKey(process.env.SENDGRID_API_KEY);
const { EmailTemplate } = require('./emailTemplate')

const sendEmail = (to, body, type='register', subject="Registration") => {
    try {

        let templateBody;
        if(type == 'register') {
            templateBody = EmailTemplate(body.otp)
        }
        if(!templateBody) {
            throw new Error("Something went wrong!")
        }
        const message = {
            from: {
                email: 'xxstyagixx@gmail.com',
                name: 'Sploot'
            },
            to: {
                email: to,
            },
            subject: subject,
            content: [
              {
                type: 'text/html',
                value: templateBody
              }
            ]
          };
          
        client
        .send(message)
        .then(() => console.log('Mail sent successfully'))
        .catch(error => {
            console.error('error is here',error);
        });
    }
    catch ( error ) {
        console.log(error, 'error is here')
        throw error ;
    }
}

module.exports = sendEmail