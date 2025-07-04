import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

export const EmailVerificationEmail = ({
    verificationLink,
}) => {
    return (
        <Html>
            <Head />
            <Preview>Verify your email address for Project Management</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Text style={text}>Hi there,</Text>
                        <Text style={text}>
                            Thank you for signing up for Project Management. Please verify your email address by clicking the button below.
                        </Text>
                        <Button style={button} href={verificationLink}>
                            Verify Email
                        </Button>
                        <Text style={text}>
                            If you did not sign up for this account, you can ignore this email.
                        </Text>
                        <Text style={footer}>
                            Best regards,<br />
                            The Project Management Team
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left',
};

const button = {
    backgroundColor: '#5850ec',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    padding: '12px',
    marginTop: '16px',
    marginBottom: '16px',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
};

export default EmailVerificationEmail; 