
import React, { Component, MouseEventHandler, useEffect, useState } from 'react';
import { getAllBooks,deleteBook,addToBasket } from "../../requests/genres";
import { FaTrash,FaShoppingBasket } from "react-icons/fa";
import jwt_decode from "jwt-decode";
import "./styles.css";
import { Modal } from 'react-bootstrap';
import Comments from '../comments/Comments';
import { FaComment  } from "react-icons/fa";
export interface IBook {
    id: number,
    "name": string,
    "genreID": number,
    "author": string,
    "created": string,
    "userId":string
    "price":number,
    "quality":string
}

interface MyToken {
  name: string;
  exp: number;
  sub:string;
}
export const BookList = () => {
  const [books, setBooks] = useState<IBook[]>([])
  const genreName=localStorage.getItem("genreName");
  const userStr = localStorage.getItem("user");
  const [isOpen, setIsOpen] = useState<Boolean | any>(false);
  const [currBook, setCurrBook] = useState<number>();

  let user=null;
  if (userStr)
    user = JSON.parse(userStr);

    const decodedToken = jwt_decode<MyToken>(user.accessToken);

    async function GetBooks() {
        const xd = await getAllBooks(parseInt(localStorage.getItem("genreId")!));
        setBooks(xd);
      }

    async function onBookDelete (BookId:number) {
      const genreId=parseInt(localStorage.getItem("genreId")!);
      await deleteBook(genreId,BookId);
    };

    async function onAddToBasket (BookId:number) {
      const genreId=parseInt(localStorage.getItem("genreId")!);
      await addToBasket(BookId,genreId);
    };

    function setAndToggle (bookId:number){
      setCurrBook(bookId);
      toggleFormStatus();
  };

  function toggleFormStatus (){
    setIsOpen(!isOpen);
};


    useEffect(() => {
        GetBooks();
      });

      if (books.length === 0) {
        return(
          <h1>No books exist in genre {genreName}.</h1>
        ) 
      }
        return (      
        <div>
          
          <h3>{genreName}</h3>
          <table className='w-100'>
            <tbody>
            <tr id="header" className='bg-blue'>
            <td >Name</td>
            <td >Author</td>
            <td >Price</td>
            <td >Quality</td>
            <td >Upload date</td>
            </tr>
                  {books.map((x, index) => (
          <tr key={index} >
            <td style={{ color: 'black' }}>{x.name}</td>
            <td style={{ color: 'black' }}>{x.author}</td>
            <td style={{ color: 'black' }}>{x.price}</td>
            <td style={{ color: 'black' }}>{x.quality}</td>
            <td style={{ color: 'black' }}>{x.created.substring(0,10)}</td>
            <td>
            {x.userId == decodedToken.sub || localStorage.getItem('Role') == 'Admin'  ?
              <button onClick={() => onBookDelete(x.id)} className='btn btn-danger btn-sm rounded-0'>
                  <FaTrash />
              </button>
              :
              (
                <button onClick={() => onAddToBasket(x.id)} className='btn btn-primary btn-sm rounded-0'>
                  <FaShoppingBasket />
              </button>
              )
            }
            </td>
            <td>
              <button onClick={() => setAndToggle(x.id)} className='btn'>
              <FaComment/>
              </button>
            </td>
            
          </tr>
        ))}
            </tbody>
        
        </table>

        <Modal show={isOpen} onHide={toggleFormStatus}>
                    <Modal.Header closeButton>
                        <Modal.Title> Comments </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Comments 
                            bookId={currBook!}
                            toggleModal={setAndToggle!}
                        />
                    </Modal.Body>
                </Modal>
                
        </div>
    )
}