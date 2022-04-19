// node_modules
import React, { useState, useEffect, useContext, useRef } from "react";
import {
    Grid,
    InputGroup,
    Input,
    InputLeftAddon,
    InputRightAddon,
    Button,
    Flex,
    useToast,
} from "@chakra-ui/react";

// context
import WalletContext from "../../context/walletContext";

// config
import { Contracts } from "../../config";

const StakingPage: React.FC = () => {
    const walletContext = useContext(WalletContext);
    const toast = useToast();

    const [allowance, setAllowance] = useState<string>("0");
    const [totalStakedAmount, setTotalStakedAmount] = useState<string>("");
    const [stakingPoolPercent, setStakingPoolPercent] = useState<string>("");
    const [totalUnstakedAmount, setTotalUnstakedAmount] = useState<string>("");

    const stakeAmountRef = useRef() as React.MutableRefObject<HTMLInputElement>;
    const unstakeAmountRef =
        useRef() as React.MutableRefObject<HTMLInputElement>;

    useEffect(() => {
        if (walletContext.account && walletContext.stakingContract) {
            walletContext.stakingContract.methods
                .GetStakingListOf(walletContext.account)
                .call()
                .then((stakingList: any[]) => {
                    let tempTotalStakedAmount = 0;
                    let tempTotalUnstakedAmount = 0;
                    for (let i = 0; i < stakingList.length; i++) {
                        if (!stakingList[i].unstaked) {
                            tempTotalStakedAmount += Number(
                                walletContext.web3Instance.utils.fromWei(
                                    stakingList[i].amount,
                                    "ether"
                                )
                            );
                            tempTotalUnstakedAmount += Number(
                                walletContext.web3Instance.utils.fromWei(
                                    stakingList[i].availableUnstakedAmount,
                                    "ether"
                                )
                            );
                        }
                    }
                    setStakingPoolPercent("0");
                    setTotalStakedAmount(tempTotalStakedAmount.toString());
                    setTotalUnstakedAmount(tempTotalUnstakedAmount.toString());
                });
        }
    }, [walletContext.account, walletContext.stakingContract]);

    useEffect(() => {
        if (walletContext.account && walletContext.satsTokenContract) {
            walletContext.satsTokenContract.methods
                .allowance(
                    walletContext.account,
                    Contracts.stakingContract.address
                )
                .call()
                .then((satsAllowance: string) => {
                    console.log(satsAllowance);
                    setAllowance(satsAllowance);
                });
        }
    }, [walletContext.account, walletContext.satsTokenContract]);

    const onStake = () => {
        if (walletContext.account) {
            const amount = walletContext.web3Instance.utils.toWei(
                stakeAmountRef.current.value,
                "ether"
            );
            walletContext.stakingContract.methods
                .stake(amount)
                .send({ from: walletContext.account });
        } else {
            toast({
                title: `Wallet not connected`,
                status: "error",
                isClosable: true,
                duration: 3000,
            });
        }
    };

    const onUnstake = () => {
        if (walletContext.account) {
            const amount = walletContext.web3Instance.utils.toWei(
                unstakeAmountRef.current.value,
                "ether"
            );
            walletContext.stakingContract.methods
                .unstake(amount)
                .send({ from: walletContext.account });
        } else {
            toast({
                title: `Wallet not connected`,
                status: "error",
                isClosable: true,
                duration: 3000,
            });
        }
    };

    const onApprove = () => {
        if (walletContext.account) {
            walletContext.satsTokenContract.methods
                .approve(
                    Contracts.stakingContract.address,
                    stakeAmountRef.current.value
                )
                .send({ from: walletContext.account });
        } else {
            toast({
                title: `Wallet not connected`,
                status: "error",
                isClosable: true,
                duration: 3000,
            });
        }
    };

    return (
        <Grid
            backgroundColor={"rgb(126, 126, 125)"}
            alignItems={"center"}
            margin-top={"30px"}
            width={"500px"}
            borderRadius={"10px"}
            sx={{
                "@media only screen and (max-width: 600px)": {
                    width: "90%",
                    marginLeft: "auto",
                    marginRight: "auto",
                },
            }}
            padding={"30px"}
        >
            <InputGroup backgroundColor={"white"} color={"black"}>
                <InputLeftAddon
                    children="Total Staked Amount"
                    sx={{
                        "@media only screen and (max-width: 600px)": {
                            fontSize: "12px",
                        },
                    }}
                />
                <Input value={totalStakedAmount} disabled />
            </InputGroup>
            <InputGroup backgroundColor={"white"} color={"black"} mt={"20px"}>
                <InputLeftAddon
                    children="% Staking Pool"
                    sx={{
                        "@media only screen and (max-width: 600px)": {
                            fontSize: "12px",
                        },
                    }}
                />
                <Input value={stakingPoolPercent} disabled />
            </InputGroup>
            <InputGroup backgroundColor={"white"} color={"black"} mt={"20px"}>
                <Input
                    placeholder="Staking Amount of SATs Token"
                    borderRadius={"none"}
                    borderBottom={"3px solid black"}
                    ref={stakeAmountRef}
                />
                <InputRightAddon
                    onClick={() => {
                        stakeAmountRef.current.value = totalStakedAmount;
                    }}
                    cursor={"pointer"}
                    children="MAX"
                />
            </InputGroup>
            <Flex alignItems={"center"} justifyContent={"center"} mt={"20px"}>
                <Button width={"200px"} onClick={onApprove}>
                    Approve
                </Button>
            </Flex>
            <Flex alignItems={"center"} justifyContent={"center"} mt={"20px"}>
                <Button
                    width={"200px"}
                    onClick={onStake}
                    disabled={allowance === "0"}
                >
                    Stake
                </Button>
            </Flex>

            <InputGroup backgroundColor={"white"} color={"black"} mt={"40px"}>
                <InputLeftAddon
                    children="Total Untaked Amount"
                    sx={{
                        "@media only screen and (max-width: 600px)": {
                            fontSize: "12px",
                        },
                    }}
                />
                <Input value={totalUnstakedAmount} disabled />
            </InputGroup>
            <InputGroup backgroundColor={"white"} color={"black"} mt={"20px"}>
                <Input
                    placeholder="Unstaking Amount of SATs Token"
                    borderRadius={"none"}
                    borderBottom={"3px solid black"}
                    ref={unstakeAmountRef}
                />
                <InputRightAddon
                    onClick={() => {
                        unstakeAmountRef.current.value = totalUnstakedAmount;
                    }}
                    cursor={"pointer"}
                    children="MAX"
                />
            </InputGroup>
            <Flex alignItems={"center"} justifyContent={"center"} mt={"20px"}>
                <Button width={"200px"} onClick={onUnstake}>
                    Unstake
                </Button>
            </Flex>
        </Grid>
    );
};

export default StakingPage;
