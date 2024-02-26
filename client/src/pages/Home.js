import React from 'react';
import { Container, Button, Form, Accordion } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios'
// import { useNavigate } from 'react-router-dom';
// import 'dotenv/config'

const Home = () => {
	// const navigate = useNavigate();

	// require('dotenv').config()

	const [response, setResponse] = useState(null);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState(null);

	const getResponse = async (event) => {
		event.preventDefault();
		setLoading(true);
		try {
			const input = event.target[0].value;
			const res = await axios.get(`http://localhost:5000/gen/${input}`);
            const text = res.data;

			setErr(null);
			setResponse(text);
		} catch (err) {
			setResponse(null);
			setErr(err);
            console.log(err)
		} finally {
			setLoading(false);
		}
	};


	return (
		<>
			<Container className='m-auto mt-5 mb-5 justify-content-center d-flex flex-column align-items-center'>
				<Container className='d-flex justify-content-center '>
					<Form onSubmit={getResponse} className='d-flex w-100 justify-content-center'>
						<h3 className='mt-2 mb-0'>Generate questions about</h3>
						<Form.Control className='m-0 ms-2 me-2 w-25' size='lg' type='text' placeholder='' />
						<Button style={{ width: '4rem' }} variant='primary' type='submit'>
							Go
						</Button>
					</Form>
				</Container>
				<hr className='w-75 mt-4 mb-4' />
				<Container>
						{loading ? (
                            <Container className='m-auto w-75 p-5 generated-text border-2-black rounded'>
							<h3>Loading ...</h3>
                            </Container>
						) : err ? (
                            <Container className='m-auto w-75 p-5 generated-text border-2-black rounded'>
							<h3>Sorry, something went wrong.</h3>
                            </Container>
						) : response ? (
                            <Container className='m-auto w-75 p-5 text-sm border-2-black rounded'>
							<p>{response}</p>
                            </Container>
						) : (
							<></>
						)}
				</Container>
			</Container>
		</>
	);
};

export default Home;
