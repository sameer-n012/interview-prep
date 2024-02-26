import React from 'react';
import { Container, Accordion, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
	const resps = ['response 1', 'response 2'];

	const [history, setHistory] = useState(null);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState(null);

	useEffect(() => {
		const getHistory = async () => {
			setLoading(true);
            console.log('here')
			try {
                let n = 10
				const res = await axios.get(`http://localhost:5000/history/${history ? history.length : 0}/${n}`);
				const hist = res.data;

				setErr(null);
                if(history) { setHistory(history.concat(hist)); } 
                else { setHistory(hist); }
				// console.log(hist);
			} catch (err) {
				setHistory(null);
				setErr(err);
				console.log(err);
			} finally {
				setLoading(false);
			}
		};

		if (!history && !err) {
			getHistory();
		}
	}, [history]);

	return (
		<>
			<Container className='m-auto mt-5 mb-5 justify-content-center d-flex flex-column align-items-center'>
                <Container className='d-flex justify-content-center '>
                    {loading ? (
                        <Container className='m-auto w-75 p-5 generated-text border-2-black rounded'>
                            <h3>Loading ...</h3>
                        </Container>
                    ) : err ? (
                        <Container className='m-auto w-75 p-5 generated-text border-2-black rounded'>
                            <h3>Sorry, something went wrong.</h3>
                        </Container>
                    ) : history && history.length > 0 ? (
                        <Accordion className='w-75'>
                            {history.map((h, i) => (
                                <Accordion.Item eventKey={h._id}>
                                    <Accordion.Header className='text-sm'>
                                        <p className='text-sm m-0'>{h.time}: {h.topic}</p>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <p className='text-xsm m-0'>{h.text}</p>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    ) : history && history.length == 0 ? (
                        <Container className='m-auto w-75 p-5 generated-text border-2-black rounded'>
                            <h3>No history yet...</h3>
                        </Container>
                    ) : (
                        <></>
                    )}
                </Container>
			</Container>
		</>
	);
};

export default History;
