import mailService from "../services/mail";

export const deliverConfirmationEmail = async (email: string, username: string, token: string) => {
    await mailService.sendMail(email, "Confirm Email Address", await confirmemailbody(process.env.FRONTEND_URL as string, username, token));
}

export const deliverForgotPasswordEmail = async (email: string, username: string, token: string) => {
    await mailService.sendMail(email, "Reset Wanderers Password", await forgetpasswordbody(process.env.FRONTEND_URL as string, username, token));
}

export const deliverPasswordResetSuccessfulEmail = async (email: string, username: string) => {
    await mailService.sendMail(email, "Password Changed", await successfulpasswordresetbody(username));
}


const forgetpasswordbody = (url: string, username: string, token: string) => {
	var date = new Date();
	date.setDate(date.getDate() + 1);

    return `
	Hi ${username}!

	<br/>
	We received a request to reset your account password. Please use the following link to verify yourself. This link is valid for 1 day till ${date}.
	<br/><br/>
	Click on this <a href="${url}/auth/reset-password/${token}">${url}/auth/reset-password/${token}</a> to reset your password
	<br/><br/>
	If you didn't initiate this action or if you think you received this email by mistake, please contact support@wanderers.com
    `
}

const successfulpasswordresetbody = (username: string) => {
	return `
	Hi ${username}!

	<br/>
	Your password has been successfully reset. If you did not initiate this action, please contact support@wanderers.com
	<br/><br/>
	You can now login to your account using your new password.
	`
}

const confirmemailbody = (url: string, username: string, token: string) => {
    return `
	Welcome ${username}!

	<br/><br/>
	Thanks for signing up with Wanderers!
	<br/>
	You must follow this link to activate your account:
	<br/>
    Click on this <a href="${url}/auth/confirm-account/${token}">${url}/auth/confirm-account/${token}</a> to confirm your email

	<br/><br/>
	Have fun, and don't hesitate to contact us with your feedback.
    `
}


export default {
	deliverConfirmationEmail,
	deliverForgotPasswordEmail,
	deliverPasswordResetSuccessfulEmail
};
