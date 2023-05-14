import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// const ABI = require("../contract/abi.json");
const ALCHEMY_KEY_MUMBAI= "XfU2gmaFvWo_0B-BK8shsBO5CdsApKNH";
const SwapABI = require("../contract/swapContractABI.json");
const swapContractAddr = "0xA4E3e5B9f9b9BEcA5019afFaE9f89095091F790F"; // Polygon final Mainnet
// const depositTokenAddr = "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"; // WETH on testnet
const depositTokenAddr = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH on mainnet

const getAsset = (tokenAddress) => {
    console.log(tokenAddress);
    return tokenAddress;
}

function createData(activity) {
    return { 
        time: activity?.count,
        from: activity?.fromToken,
        fromAmount: activity?.fromTokenAmount,
        to:activity?.destToken,
        toAmount:activity?.destTokenAmount,
        pl: 10
    }     
}

export function ActivityTable({userAddress}) {
    console.log("userAddress:", userAddress);
    const [activities, setActivities] = useState([]);
    const [activityAccount, setActivityAccount] = useState(Number(0));
    const [rows, setRows] = useState([]);

    function _incActivityCount() {
        let pre = activityAccount;
        setActivityAccount(pre + 1);
    }

    const _formatRows = (activities) => {
        let rows = [];
        let counter = 0;
        activities?.forEach((activity) => {
            let row = createData(activity);
            console.log("row:", counter, row);
            console.log("time<>idx:", row.time, counter);
            if(row.time >= counter){
                // time should be gt counter.
                rows.push(row);
                ++counter;   
            }
        });
        setRows(rows);
    }

    async function _getTransfer(){
        const provider = new ethers.WebSocketProvider(
            `wss://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_KEY_MUMBAI}`,
            "maticmum"
        );
        const contract = new ethers.Contract(swapContractAddr, SwapABI, provider);
        
        console.log("Start listening...");
        // event SwapExecuted(address indexed user, address fromToken, uint256 fromTokenAmount, address destToken, uint256 destTokenAmount);
        const filter = contract.filters.SwapExecuted(userAddress);
        contract.on(filter, (user, fromToken, fromTokenAmount, destToken, destTokenAmount)=> {
            _incActivityCount();
    
            let transferEvent ={
                count:activityAccount,
                fromToken,
                fromTokenAmount,
                destToken,
                destTokenAmount,
            };

            // BE CAREFUL:
            // activities.push(transferEvent) returns the number of items, which is 2!!
            activities.push(transferEvent);
            console.log("new activities:", activities);
            setActivities(activities);
        })
    }

    useEffect(() => {
        // post-process to format the information
        const fetchData = async () => {
            await _getTransfer();
            _formatRows(activities);
          }
        
        fetchData().catch(console.error);
    }, [activities.length])

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell align="right">Swapping from</TableCell>
            <TableCell align="right">Swapping to</TableCell>
            <TableCell align="right">P/L</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.map((row) => (
            <TableRow
              key={row.time}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.time}
              </TableCell>
              <TableCell align="right">{row.count}</TableCell>
              <TableCell align="right">{row.fromTokenAmount} + {getAsset(row.fromToken)}</TableCell>
              <TableCell align="right">{row.destTokenAmount} + {getAsset(row.destToken)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}