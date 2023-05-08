import React, { Component, useState, useEffect, Dispatch } from "react";
import { Button, Modal, Pagination } from "react-bootstrap";
import { LineChart, PieChart } from 'react-chartkick';
import { setUserRole } from "../../requests/AdminController";
import { IBookBought, ITextsBought, ISetRoleDto, IChapters, IGenres, getPointsWord, IBookAdd, ITextAdd, handleConfirmed, handleDenied, IChaptersAdd, getSubscriberWord, handleBeingAdded, IStatus, useHandleAxiosError } from '../../Interfaces';
import { getWriterBooks, getWriterTexts, getBookChapters } from "../../requests/WriterController";
import { getAllGenres } from '../../requests/GenresController';
import { addBook, addChapter, updateBook } from "../../requests/BookController";
import { addText, updateText } from "../../requests/TextsController";
import { NavigateFunction, useNavigate } from 'react-router-dom';
import ChapterList from '../chapters/ChapterList';
import TextReadView from '../texts/TextReadView';
import BookFormModal from './books/AddBookForm';
import TextFormModal from './texts/AddTextForm';
import 'chartkick/chart.js';
import './WritersPlatform.css';
import AddChapterForm from "./chapters/AddChapterForm";
import { login } from "../../services/auth.service";
import { toast } from "react-toastify";
import CommentList from "../comments/CommentsList";
import BoughtBooks from "../profile/BoughtBooksPanel";
import { AxiosError } from "axios";
import UpdateBookFormModal from "./books/UpdateBookForm";
import UpdateTextFormModal from "./texts/UpdateTextFormModal";

interface IConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

interface WritersPlatformProps {
  useNavigate: () => NavigateFunction;
}

interface IWritersPlatformState {
  isConfirmationOpen: boolean;
  isOpen: boolean;
  books: IBookBought[];
  texts: ITextsBought[];
  pieChartData: any[];
  lineChartData: any;
}

type ChaptersCount = {
  [bookId: number]: number;
};

const ConfirmationModal: React.FC<IConfirmationModalProps> = ({ isOpen, onClose, onAgree }) => {
  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Ar sutinkate su puslapio privatumo politika?</p>
        <p>Apie ją galite paskaityti čia: https://bookie.privatumas.lt</p>
        <p></p>
        <p>Patvirtinus sutikimą, jums reikės prisijungti iš naujo.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Grįžti į namų puslapį
        </Button>
        <Button variant="primary" onClick={onAgree}>
          Sutinku
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const WritersPlatform: React.FC<WritersPlatformProps> = () => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [books, setBooks] = useState<IBookBought[]>([]);
  const [texts, setTexts] = useState<ITextsBought[]>([]);
  const [genres, setGenres] = useState<IGenres[]>([]);
  const [selectedBook, setSelectedBook] = useState<IBookBought>();
  const [selectedtext, setSelectedText] = useState<ITextsBought>();
  const [showChapterList, setShowChapterList] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [updatePage, setUpdatePage] = useState(false);
  const [isBookCommentsOpen, setIsBookCommentsOpen] = useState<boolean>(false);
  const [isTextCommentsOpen, setIsTextCommentsOpen] = useState<boolean>(false);
  const handleAxiosError = useHandleAxiosError();
  const [showUpdateBookModal, setShowUpdateBookModal] = useState(false);
  const [showUpdateTextModal, setShowUpdateTextModal] = useState(false);



  //pagination
  const [pageText, setTextPage] = useState(0);
  const [pageBook, setBookPage] = useState(0);

  const perPage = 2;
  const numTextPages = Math.ceil(texts.length / perPage);
  const numBookPages = Math.ceil(books.length / perPage);

  const textsToDisplay = texts.slice(pageText * perPage, (pageText + 1) * perPage);
  const booksToDisplay = books.slice(pageBook * perPage, (pageBook + 1) * perPage);

  const [userrole, setUserrole] = useState<string | null>("");
  const [pieChartData, setPieChartData] = useState<any[]>([
    ["Fantasy", 10],
    ["Mystery", 20],
    ["Romance", 15],
    ["Horror", 5]
  ]);
  const [lineChartData, setLineChartData] = useState<any>({
    "2022-01-01": 4,
    "2022-02-01": 2,
    "2022-03-01": 6,
    "2022-04-01": 8,
    "2022-05-01": 5
  });
  const navigate = useNavigate();

  useEffect(() => {
    GetBooks();
    GetTexts();
    GetGenres();
    setIsConfirmationOpen(true);
    setUserrole(localStorage.getItem("role"));
  }, []);

  async function GetBooks() {
    try {
      const xd = await getWriterBooks();

      // Loop through all books and fetch their chapters
      const booksWithChapters = await Promise.all(
        xd.map(async (book: IBookBought) => {
          const chapters = await getBookChapters(book.id, book.genreName);
          return {
            ...book,
            chapters: chapters,
          };
        })
      );

      setBooks(booksWithChapters);
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  }

  async function SetUserRole(dto: ISetRoleDto) {
    try {
      const response = await setUserRole(dto);
      localStorage.setItem("role", "BookieWriter");
      handleConfirmed(`Vartotojo rolė sėkmingai pakeista.`);
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  }

  async function GetGenres() {
    try {
      const xd = await getAllGenres();
      setGenres(xd);
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  }

  const GetTexts = async () => {
    try {
      const xd = await getWriterTexts();
      setTexts(xd);
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  };

  const handleConfirmationClose = () => {
    navigate("/");
  };

  const handleAgree = () => {
    const setRole: ISetRoleDto = {
      roleName: "BookieWriter"
    };
    SetUserRole(setRole);
    setIsConfirmationOpen(false);
    navigate("/login");
  };

  const handleAddBook = () => {
    setShowAddBookModal(true);
  };

  const handleUpdateBook = (book: IBookBought) => {
    setSelectedBook(book);
    setShowUpdateBookModal(true);
  };

  const handleUpdateText = (text: ITextsBought) => {
    setSelectedText(text);
    setShowUpdateTextModal(true);
  };

  const handleAddText = () => {
    setShowAddTextModal(true);
  };

  const handleAddChapter = (book: IBookBought) => {
    setSelectedBook(book);
    setShowAddChapterModal(true);
  };

  const handleChapterFormSubmit = async (file: File, name: string, isFinished: number) => {
    try {
      const toastId = handleBeingAdded("Jūsų skyrius pridedamas...");

      const chapter: IChaptersAdd = {
        name: name,
        content: file,
        isFinished: isFinished,
        bookId: selectedBook!.id,
      };

      const response = await addChapter(chapter, selectedBook!.genreName);

      if (toastId) {
        toast.dismiss(toastId);
      }

      if (response.errorMessage === '') {
        if (response.chargedUsersCount === 0) {
          handleConfirmed(`Skyrius "${chapter.name}" pridėtas prie knygos "${selectedBook!.name}".`);
        } else {
          handleConfirmed(`Skyrius "${chapter.name}" pridėtas prie knygos "${selectedBook!.name}". Taškai gauti už ${response.chargedUsersCount} ${getSubscriberWord(response.chargedUsersCount)}`);
        }
        await GetBooks();
      } else {
        handleDenied(response.errorMessage);
      }
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  };

  async function handleReadBookClick(book: IBookBought) {
    setSelectedBook(book);
    setShowChapterList(true);
  }

  async function handleReadTextClick(text: ITextsBought) {
    setSelectedText(text);
    setShowTextModal(true);
  }

  const handleHideModal = () => {
    setShowChapterList(false);
    setShowTextModal(false);
    setShowAddBookModal(false);

    setShowAddChapterModal(false);
    setShowAddTextModal(false);
    setShowAddChapterModal(false);
    setIsBookCommentsOpen(false);
    setIsTextCommentsOpen(false);
    setUpdatePage(true);
  };

  const handleUpdateBookModal = () => {
    setShowUpdateBookModal(false);
  }

  const handleUpdateTextModal = () => {
    setShowUpdateTextModal(false);
  }

  const handleAddBookFormSubmit = async (
    name: string,
    genre: string,
    description: string,
    chapterPrice: number,
    bookPrice: number,
    coverImage: File
  ) => {
    try {
      const toastId = handleBeingAdded("Jūsų knyga pridedama...");

      const book: IBookAdd = {
        name: name,
        description: description,
        chapterPrice: chapterPrice.toString(),
        bookPrice: bookPrice.toString(),
        coverImage: coverImage,
      };

      const response = await addBook(genre, book);

      if (toastId) {
        toast.dismiss(toastId);
      }

      if (response === 'success') {
        handleConfirmed(`Knyga "${book.name}" pridėta sėkmingai.`);
        GetBooks();
      } else {
        handleDenied(response);
      }
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  };

  const handleUpdateBookFormSubmit = async (book: IBookBought, coverImage: File) => {
    try {
      const toastId = handleBeingAdded("Jūsų knyga atnaujinama...");

      const response = await updateBook(book.genreName, book, coverImage);

      if (toastId) {
        toast.dismiss(toastId);
      }

      if (response === 'success') {
        handleConfirmed(`Knyga "${book.name}" atnaujinta sėkmingai.`);
        GetBooks();
      } else {
        handleDenied(response);
      }
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  };

  const handleUpdateTextFormSubmit = async (text: ITextsBought, coverImage: File, content: File) => {
    try {
      console.log("jusu tekstas:", text)
      const toastId = handleBeingAdded("Jūsų tekstas atnaujinamas...");

      const response = await updateText(text.genreName, text, coverImage, content);

      if (toastId) {
        toast.dismiss(toastId);
      }

      if (response === 'success') {
        handleConfirmed(`Tekstas "${text.name}" atnaujintas sėkmingai.`);
        GetTexts();
      } else {
        handleDenied(response);
      }
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  };

  const handleTextFormSubmit = async (
    name: string,
    genre: string,
    description: string,
    textPrice: number,
    coverImage: File,
    content: File
  ) => {
    try {
      const toastId = handleBeingAdded("Jūsų tekstas pridedamas...");

      const text: ITextAdd = {
        name: name,
        description: description,
        price: textPrice.toString(),
        content: content,
        coverImage: coverImage,
      };

      const response = await addText(genre, text);

      if (toastId !== 0) {
        toast.dismiss(toastId);
      }

      if (response === 'success') {
        handleConfirmed(`Tekstas "${text.name}" pridėtas sėkmingai.`);
        GetTexts();
      } else {
        handleDenied(response);
      }
    } catch (error) {
      handleAxiosError(error as AxiosError);
    }
  };

  const handleOpenBookComments = (book: IBookBought) => {
    setSelectedBook(book);
    setIsBookCommentsOpen(true);
  }

  const handleOpenTextComments = (text: ITextsBought) => {
    setSelectedText(text);
    setIsTextCommentsOpen(true);
  }

  return (
    <div>
      {userrole !== "BookieWriter" &&
        userrole !== "Admin" && (
          <ConfirmationModal
            isOpen={isConfirmationOpen}
            onClose={handleConfirmationClose}
            onAgree={handleAgree}
          />
        )}
      <div className="writers-platform">
        <div className="textsAndBooks">
          <div className="books-and-texts">
            <div className="add-button-container">
              <Button className="add-btn" onClick={handleAddText}>
                Pridėti tekstą
              </Button>
              <Button className="add-btn" onClick={handleAddBook}>
                Pridėti knygą
              </Button>
            </div>

            <div className="book-list">
              <h3>Knygos</h3>
              {books.length === 0 ? (
                <p>Knygų sąrašas tuščias</p>
              ) : (
                <ul>
                  {booksToDisplay.map((book) => (
                    <li key={book.id}>
                      <p className="book-name"> Knygos pavadinimas: {book.name}</p>
                      <p className="book-price"> Kaina: {book.price} {getPointsWord(book.price)}</p>
                      <p className="book-description"> Įkelta: {new Date(book.created.toString()).toISOString().split('T')[0]}</p>
                      <p className={`book-status status-${IStatus[book.status]}`}> Statusas: {IStatus[book.status]}</p>
                      {book.statusMessage !== "" && book.status === IStatus.Atmesta &&
                        <p className={`book-status status-${IStatus[book.status]}`}> Komentaras: {book.statusMessage}</p>
                      }
                      <div>
                        {book.status == IStatus.Patvirtinta &&
                          <div>
                            {book.chapters?.length === 0 ? (
                              <button disabled={true} className="btn-disabled">Peržiūrėti turinį</button>
                            ) : (
                              <button className="view-content btn-color1" onClick={() => handleReadBookClick(book)}>Peržiūrėti turinį</button>
                            )}
                            <button className="comments btn-color3" onClick={() => handleOpenBookComments(book)}>Komentarai</button>
                            {book.isFinished === 0 && (
                              <button className="add-chapter btn-color2" onClick={() => handleAddChapter(book)}>Pridėti skyrių</button>
                            )}
                          </div>
                        }
                        {book.status == IStatus.Atmesta &&
                          <div>
                            <button className="edit-book btn-color2" onClick={() => handleUpdateBook(book)}>Redaguoti</button>
                          </div>
                        }
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {numBookPages > 1 && (
              <div className="pagination-container">
                <Pagination size="sm">
                  {Array.from(Array(numBookPages), (e, i) => (
                    <Pagination.Item
                      key={i}
                      active={i === pageBook}
                      onClick={() => setBookPage(i)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </div>
            )}

            {showChapterList && selectedBook && (
              <ChapterList
                book={selectedBook}
                show={showChapterList}
                onHide={handleHideModal}
              />
            )}

            {showAddBookModal && (
              <BookFormModal
                show={showAddBookModal}
                genrelist={genres}
                onHide={handleHideModal}
                onSubmit={handleAddBookFormSubmit}
              />
            )}

            {showUpdateBookModal && (
              <UpdateBookFormModal
                show={showUpdateBookModal}
                genrelist={genres}
                onHide={handleUpdateBookModal}
                onSubmit={handleUpdateBookFormSubmit}
                book={selectedBook!}
              />
            )}

            {showUpdateTextModal && (
              <UpdateTextFormModal
                show={showUpdateTextModal}
                genrelist={genres}
                onHide={handleUpdateTextModal}
                onSubmit={handleUpdateTextFormSubmit}
                text={selectedtext!}
              />
            )}

            {showAddTextModal && (
              <TextFormModal
                show={showAddTextModal}
                genrelist={genres}
                onHide={handleHideModal}
                onSubmit={handleTextFormSubmit}
              />
            )}

            {showAddChapterModal && (
              <AddChapterForm
                show={showAddChapterModal}
                onHide={handleHideModal}
                onSubmit={handleChapterFormSubmit}
              />
            )}

            {isBookCommentsOpen &&
              <CommentList
                isOpen={isBookCommentsOpen}
                onClose={handleHideModal}
                isProfile={true}
                entityId={selectedBook!.id}
                commentType='Book'
                genreName={selectedBook!.genreName}
                bookId={0} //zero because its not for chapters
              />
            }

            {isTextCommentsOpen &&
              <CommentList
                isOpen={isTextCommentsOpen}
                onClose={handleHideModal}
                isProfile={true}
                entityId={selectedtext!.id}
                commentType='Text'
                genreName={selectedtext!.genreName}
                bookId={0} //zero because its not for chapters
              />
            }

            <div className="text-list">
              <h3>Tekstai</h3>
              {texts.length === 0 ? (
                <p>Tekstų sąrašas tuščias</p>
              ) : (
                <ul>
                  {textsToDisplay.map((text) => (
                    <li key={text.id}>
                      <p className="book-name"> Teksto pavadinimas: {text.name}</p>
                      <p className="book-price"> Kaina: {text.price} {getPointsWord(text.price)}</p>
                      <p className="book-description"> Įkelta: {new Date(text.created.toString()).toISOString().split('T')[0]}</p>
                      <p className={`book-status status-${IStatus[text.status]}`}> Statusas: {IStatus[text.status]}</p>
                      {text.statusMessage !== "" && text.status === IStatus.Atmesta &&
                        <p className={`book-status status-${IStatus[text.status]}`}> Komentaras: {text.statusMessage}</p>
                      }
                      {text.status == IStatus.Patvirtinta &&
                        <div>
                          <button className="view-content btn-color1" onClick={() => handleReadTextClick(text)}>Peržiūrėti turinį</button>
                          <button className="comments btn-color3" onClick={() => handleOpenTextComments(text)}>Komentarai</button>
                        </div>
                      }
                      {text.status == IStatus.Atmesta &&
                        <div>
                          <button className="edit-book btn-color2" onClick={() => handleUpdateText(text)}>Redaguoti</button>
                        </div>
                      }

                    </li>
                  ))}
                  {showTextModal && selectedtext && (
                    <TextReadView
                      text={selectedtext}
                      show={showTextModal}
                      onHide={handleHideModal}
                    />
                  )}
                </ul>
              )}
            </div>
            {numTextPages > 1 && (
              <Pagination size="sm">
                {Array.from(Array(numTextPages), (e, i) => (
                  <Pagination.Item
                    key={i}
                    active={i === pageText}
                    onClick={() => setTextPage(i)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            )}

          </div>
          <div className="statistics">
            <h2>Pardavimų statistika</h2>
            <div className="chart">
              <PieChart data={pieChartData} />
            </div>
            <div className="chart">
              <LineChart data={lineChartData} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WritersPlatform;