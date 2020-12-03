import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "use-wallet";
import PropTypes from "prop-types";
import {
  DataView,
  ContextMenu,
  ContextMenuItem,
  Header,
  Button,
  AddressField,
  SidePanel,
  IconStarFilled,
  IconStar,
} from "@aragon/ui";
import { useFavoriteFunds } from "../../contexts/FavoriteFundsContext";
import MintNftPanel from "./Panels/MintFundPanel";
import TransferNftPanel from "./Panels/BurnFundPanel";
import CreateErc20Panel from "../InnerPanels/CreateErc20Panel";
import CreateFundPanel from "../InnerPanels/CreateFundPanel";
import ManageFundPanel from "../InnerPanels/ManageFundPanel";
import Web3 from "web3";
import Nftx from "../../contracts/NFTX.json";
import XStore from "../../contracts/XStore.json";
import XToken from "../../contracts/XToken.json";
import addresses from "../../addresses/rinkeby.json";

function D1FundList() {
  const { account } = useWallet();
  const { current: web3 } = useRef(new Web3(window.ethereum));
  const nftx = new web3.eth.Contract(Nftx.abi, addresses.nftxProxy);
  const xStore = new web3.eth.Contract(XStore.abi, addresses.xStore);

  const [panelTitle, setPanelTitle] = useState("");
  const [panelOpened, setPanelOpened] = useState(false);
  const [innerPanel, setInnerPanel] = useState(<div></div>);

  const [chainData, setChainData] = useState({});
  const [tableEntries, setTableEntries] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const allDone = () => {
        return resRemaining === 0;
      };
      const data = {};
      let resRemaining = 0;
      const update = (data) => {
        setChainData(data);
        setTableEntries(getAllEntries());
      };
      getAllEntries().forEach((entry) => {
        const fundToken = new web3.eth.Contract(XToken.abi, entry.address);
        data[entry.address] = {};
        resRemaining += 1;
        xStore.methods
          .isFinalized(entry.vaultId)
          .call({ from: account })
          .then((retVal) => {
            data[entry.address].isFinalized = retVal.toString();
            resRemaining -= 1;
            allDone() && update(data);
          });
        resRemaining += 1;
        fundToken.methods
          .totalSupply()
          .call({ from: account })
          .then((retVal) => {
            data[entry.address].totalSupply = retVal;
            resRemaining -= 1;
            allDone() && update(data);
          });
      });
    }, 500);
  }, []);

  const {
    favoriteFunds,
    isAddressFavorited,
    removeFavoriteByAddress,
    addFavorite,
  } = useFavoriteFunds();

  const entries = [
    {
      ticker: "PUNK-BASIC",
      address: "0x7974566f15E3e456fE1eA617358Be4bDB1a10C05",
      vaultId: 0,
    },
    {
      ticker: "PUNK-ATTR-4",
      address: "0xaeE76c0bD1ABa53DC44bC797385b4311aB8e4B36",
      vaultId: 1,
    },
    {
      ticker: "PUNK-ATTR-5",
      address: "0x82C99f2FAE45438355922AfA143E39D970277f82",
      vaultId: 2,
    },
    {
      ticker: "PUNK-ZOMBIE",
      address: "0x2df3365037e71eAA70aC30b0d712882008C86B93",
      vaultId: 3,
    },
    {
      ticker: "GLYPH",
      address: "0x50Fcdf958847E08be3C2CdABC30111E23D7B068C",
      vaultId: 4,
    },
    {
      ticker: "JOY",
      address: "0x65766FffBa5e5Eb63a482E4002e4956c29965b04",
      vaultId: 5,
    },
  ];

  const getAllEntries = () =>
    favoriteFunds.concat(
      entries.filter((e) => !favoriteFunds.find((f) => f.address === e.address))
    );

  const handleClickCreate = () => {
    setPanelTitle("Create a D1 Fund (Step 1/2)");
    setInnerPanel(
      <CreateErc20Panel
        onContinue={(tokenAddress, tokenSymbol) => {
          setPanelOpened(false);
          setTimeout(() => {
            setPanelTitle("Create a D1 Fund (Step 2/2)");
            setInnerPanel(
              <CreateFundPanel
                tokenAddress={tokenAddress}
                onContinue={(vaultId) => {
                  addFavorite({
                    ticker: tokenSymbol,
                    address: tokenAddress,
                    vaultId: vaultId,
                  });
                  setPanelOpened(false);
                }}
              />
            );
            setPanelOpened(true);
          }, 500);
        }}
      />
    );
    setPanelOpened(true);
  };

  const handleMint = (address, name) => {
    setPanelTitle(`${name} ▸ Mint`);
    setInnerPanel(
      <MintNftPanel
        contractAddress={address}
        closePanel={() => setPanelOpened(false)}
      />
    );
    setPanelOpened(true);
  };

  const handleRedeem = (vaultId, name) => {
    setPanelTitle(`${name} ▸ Transfer`);
    setInnerPanel(
      <TransferNftPanel closePanel={() => setPanelOpened(false)} />
    );
    setPanelOpened(true);
  };

  const handleManage = (vaultId, name) => {
    setPanelTitle(`Manage ${name}`);
    setInnerPanel(
      <ManageFundPanel
        vaultId={vaultId}
        closePanel={() => setPanelOpened(false)}
      />
    );
    setPanelOpened(true);
  };

  return (
    <div>
      <Header
        primary="D1 Funds"
        secondary={
          <Button label="Create D1 Fund" onClick={handleClickCreate} />
        }
      />
      <DataView
        status="loading"
        fields={["Ticker", "Token Address", "Supply", ""]}
        entries={tableEntries}
        renderEntry={(entry) => {
          const { ticker, address, vaultId } = entry;
          return [
            <div>{ticker}</div>,
            <AddressField address={address} autofocus={false} />,
            <div>{chainData[address] && chainData[address].totalSupply}</div>,
            <div
              css={`
                & > svg {
                }
                cursor: pointer;
                padding: 5px;
              `}
              onClick={() =>
                isAddressFavorited(address)
                  ? removeFavoriteByAddress(address)
                  : addFavorite(entry)
              }
            >
              {isAddressFavorited(address) ? <IconStarFilled /> : <IconStar />}
            </div>,
          ];
        }}
        renderEntryActions={(entry, index) => {
          // const entryOwner =
          return (
            <ContextMenu>
              <ContextMenuItem
                onClick={() => handleMint(entry.address, entry.ticker)}
              >
                Mint
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleRedeem(entry.address, entry.ticker)}
              >
                Redeem
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleManage(entry.vaultId, entry.ticker)}
              >
                Manage...
              </ContextMenuItem>
              {}
            </ContextMenu>
          );
        }}
      />
      <SidePanel
        title={panelTitle}
        opened={panelOpened}
        onClose={() => setPanelOpened(false)}
      >
        {innerPanel}
      </SidePanel>
    </div>
  );
}

export const NftType = PropTypes.shape({
  name: PropTypes.string,
  supply: PropTypes.string,
  address: PropTypes.string,
});

D1FundList.propTypes = {
  title: PropTypes.string,
  entries: PropTypes.arrayOf(NftType),
  handleMint: PropTypes.func,
};

export default D1FundList;
