import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Header() {

    const { user } = useContext(AuthContext);

    return (
        <Navbar collapseOnSelect expand="lg" fixed="top" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
            <Container>
                <Navbar.Brand href="#home">TeamFusion</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    {/* admin specific options */}
                    {user?.role === 'admin' && (<Nav className="me-auto">
                        <Nav.Link href="/admin">Admin Dashboard</Nav.Link>
                        <Nav.Link href="#pricing">Bid Management</Nav.Link>
                        <Nav.Link href="/admin/upload/image">Upload Image</Nav.Link>
                        <Nav.Link href="/admin/customers">Customers</Nav.Link>
                    </Nav>)}

                    {/* customer specific options */}
                    {user?.role === 'customer' && (<Nav className="me-auto">
                        <Nav.Link href="/customer">Assigned Images</Nav.Link>
                        <Nav.Link href="#pricing">My Bids</Nav.Link>
                    </Nav>)}

                    <Nav>
                        <Nav.Link href="/logout">Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;