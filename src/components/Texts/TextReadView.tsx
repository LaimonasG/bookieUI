import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ITextsBought } from '../../Interfaces';
import './TextReadView.css';

type TextInformationModalProps = {
  text: ITextsBought;
  show: boolean;
  onHide: () => void;
};

const TextReadView: React.FC<TextInformationModalProps> = ({ text, show, onHide }) => {
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (text.content.length === 0) {
    return <p>Tekstas tuščias.</p>;
  }
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="text-read-view"
    >
      <Modal.Header closeButton onClick={handleContentClick}>
        <Modal.Title id="contained-modal-title-vcenter">{text.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body onClick={handleContentClick}>
        <p dangerouslySetInnerHTML={{ __html: text.content }} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} className="text-read-view-close-btn">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TextReadView;