import React,{useState, useEffect, useContext} from 'react';
import Style from "./NavBar.module.css";
import Image from 'next/image';
import Link from 'next/link';
import images from "../../assets"
import {Model, TokenList} from "../index";
import { SwapTokenContext } from "../../Context/SwapContext";

const NavBar = () => {
  const {account, networkConnect, connectWallet, tokenData } = useContext(SwapTokenContext);
  const menuItems = [
    {
      name: "Swap",
      link: "/"
    },
    {
      name: "Tokens",
      link: "/"
    },
    {
      name: "Pools",
      link: "/"
    }
  ]

  const [openModel, setOpenModel] = useState(false);
  const [openTokenBox, setOpenTokenBox] = useState(false);
  //const [account, setAccount] = useState(false);
  return (
    <div className={Style.NavBar}>
      <div className={Style.NavBar_box}>
        <div className={Style.NavBar_box_left}>
          <div className={Style.NavBar_box_left_img}>
            <Image src={images.uniswap} alt="logo" width={50} height={50} />
          </div>
          <div className={Style.NavBar_box_left_menu}>
            {menuItems.map((el, i)=>(
              <Link
              key={i+1}
              href={{pathname: `${el.name}`, query: `${el.link}`}}
              >
                <p className={Style.NavBar_box_left_menu_item}>
                  {el.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <div className={Style.NavBar_box_middle}>
          <div className={Style. NavBar_box_middle_search}>
           <div className={Style. NavBar_box_middle_search_img}>
            <Image src={images.search} alt="search" width={20} height={26}/>
           </div>
           <input type="text" placeholder="Search Tokens" />
          </div>
        </div>
        <div className={Style.NavBar_box_right}>
         <div className={Style.NavBar_box_right_box}>
          <div className={Style.NavBar_box_right_box_img}>
            <Image src={images.ether} alt="NetWork" height={30} width={36} />
          </div>
          <p>{networkConnect}</p>
         </div> 
         {account ? (
         <button onClick={()=>setOpenTokenBox(true)}>{account.slice(0, 3)+"..."+account.slice(account.length-3, account.length)}</button> 
         ): 
        ( 
          <button onClick={()=>setOpenModel(true)}>Connect</button>
        ) 
        }
         
          {openModel && (
          <Model setOpenModel={setOpenModel} connectWallet={connectWallet} />
          )} 
        </div>
      </div>
      {/* //TOTENLIST COMPONENT */}
      {openTokenBox && (
      <TokenList tokenDate={tokenData} setOpenTokenBox={setOpenTokenBox} />
      )}
    </div>
  )
}

export default NavBar
