import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';
import Card from 'react-bootstrap/Card';


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await login({ username: username, password: password });

            if (response.success == false) {
                navigate('/')
            }

            navigate('/home');

        } catch (err) {
            console.log(err.message)
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        }

    }

    return (
        <Container className='mt-5 w-25'>
            <Card>
                <Card.Body>
                    <h5 className='mb-5 text-center'>Login to your Account</h5>
                    <Form onSubmit={handleSubmit}>
                        {error && <p className="error-message">{error}</p>}
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={username} onChange={(e) => { setUsername(e.target.value) }} placeholder="Enter username" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => { setPassword(e.target.value) }} placeholder="Password" />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Login
                        </Button><br /><br />
                        <small>
                            Not have an account? <a href='/signup'>Create account</a>
                        </small>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )

}



