import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import { Modal } from 'react-bootstrap'
import Header from '../../components/Header'
import Card from '../../components/Card'
import Button from '../../components/Button'
import VerifyCheckIcon from '../../assets/images/verify-check.png'
import VerifyArrowRightIcon from '../../assets/images/verify-arrow-right.png'
import './style.css'

const VerifyStep = (props) => {
    return (
        <div className="verify-step-card" onClick={props.onClick}>
            <div className="verify-status">
                {props.verify ? (
                    <img src={VerifyCheckIcon} />
                ) : (
                    <div className="verify-step-number">{props.number}</div>
                )}
            </div>
            <div className="verify-description">{props.description}{props.progress && <div className="spinner-border ml-3" style={{color:'white', height:20, width:20}}></div>}</div>
            <div className="verify-arrow">
                <img src={VerifyArrowRightIcon} />
            </div>
        </div>
    )
}

const WelcomePage = (props) => {
    const { user, getAccessTokenSilently } = useAuth0();
    const [isSending, setIsSending] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const handleModalClose = () => setModalShow(false);
    const handleModalShow = () => setModalShow(true);
    const [modalShow2, setModalShow2] = useState(false);
    const handleModal2Close = () => setModalShow2(false);
    const handleModal2Show = () => setModalShow2(true);

    useEffect(() => {
        if (user.email_verified == true && props.shop && props.shop.is_set_info == true && props.shop.is_set_system == true) {
            props.history.push('/waiting');
        }
    }, []);

    const resendVerificationEmail = async () => {
        if (user.email_verified == true)
            return;

        setIsSending(true);

        try {
            var statusCode;
            const accessToken = await getAccessTokenSilently({
                audience: `${process.env.REACT_APP_AUDIENCE}`,
                scope: "update:users"
            });
            fetch(process.env.REACT_APP_API_URL + '/shop/verification-email', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                statusCode = res.status;
                return res.json();
            }).then(body => {
                if (statusCode == 201) {
                } else {
                    props.history.push('/error', {
                        status: statusCode, 
                        // error: 'Failed to send verification email',
                        error: '????????????????????????????????????????????????'
                    });
                }
                setIsSending(false);
            });
        } catch (e) {
            console.log(e);
        }
    }

    const onClickStep1 = () => {
        if (user.email_verified == true)
            return;
        handleModalShow();
    }

    const onClickStep3 = () => {
        if (props.shop && props.shop.is_set_info) 
            props.history.push('/system')
        else
            handleModal2Show();
    }

    return (
        <>
            <Header />
            <div className="container" style={{paddingTop: 70}}>
                <div className="welcome-page">
                    <Card className="welcome-page-content">
                        <div className="email">{user.email}</div>
                        <div className="headline">{/* Welcome to Qmax */}Qmax???????????????</div>
                        <div className="description">{/* Please enter the necessary information for the system */}???????????????????????????????????????????????????????????????????????????</div>
                        <VerifyStep 
                            number={1} 
                            verify={user.email_verified} 
                            // description="Authenticate registered email" 
                            description="??????????????????????????????"
                            onClick={onClickStep1} />
                        <VerifyStep 
                            number={2} 
                            verify={props.shop ? props.shop.is_set_info : false} 
                            // description="Enter store information" 
                            description="?????????????????????"
                            onClick={() => props.history.push('/store')} />
                        <VerifyStep 
                            number={3} 
                            verify={props.shop ? props.shop.is_set_system: false} 
                            // description="Enter system information" 
                            description="???????????????????????????"
                            onClick={onClickStep3} />
                    </Card>
                    
                    <Modal className="modal-sent-authentication-email" show={modalShow} onHide={handleModalClose} animation={false}>
                        <Modal.Body>
                            <div className="text">
                                {/* We have sent an authentication message to the registered email. <br/> Please authenticate your email by clicking the link or button in the body */}
                                ??????????????????????????????????????????????????????????????????????????????<br/> ??????????????????????????????????????????????????????????????????????????????????????????????????????
                            </div>
                            <Button type="button" className="secondary float-right mt-3" shadow={true} onClick={handleModalClose}>
                                {/* Close */}?????????
                            </Button>
                            <Button type="button" className="btn-resend secondary float-right mt-3 mr-3" onClick={resendVerificationEmail}>
                                {isSending ? (
                                    <div className="spinner-border" style={{height:20, width:20}}></div>
                                ) : (
                                    // 'Resend verification email'
                                    '??????????????????????????????'
                                )}
                            </Button>
                        </Modal.Body>
                    </Modal>
                    
                    <Modal className="modal-need-store-information" show={modalShow2} onHide={handleModal2Close} animation={false}>
                        <Modal.Body>
                            <div className="text">{/* To update system information, you need to input store information first */}?????????????????????????????????????????????????????????????????????????????????</div>
                            <Button type="button" className="secondary float-right mt-3" shadow={true} onClick={handleModal2Close}>
                                {/* Close */}?????????
                            </Button>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </>
    )
}

const mapStateToProps = (state) => {
    return { shop: state };
}

export default withAuthenticationRequired(connect(mapStateToProps)(WelcomePage), {
    onRedirecting: () => <div>Loading...</div>,
});
