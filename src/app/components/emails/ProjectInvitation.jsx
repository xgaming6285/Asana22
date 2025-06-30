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

export const ProjectInvitationEmail = ({
    projectName,
    inviterName,
    inviteLink,
}) => {
    return (
        <Html>
            <Head />
            <Preview>Join {projectName} on Project Management</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section>
                        <Text style={text}>Hi there,</Text>
                        <Text style={text}>
                            {inviterName} has invited you to collaborate on the project "{projectName}" using Project Management.
                        </Text>
                        <Button style={button} href={inviteLink}>
                            Join Project
                        </Button>
                        <Text style={text}>
                            If you weren't expecting this invitation, you can ignore this email.
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

export default ProjectInvitationEmail; 