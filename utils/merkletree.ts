import { MerkleTree } from "merkletreejs"
import { keccak256 } from "@ethersproject/keccak256"
import { ethers } from "hardhat"

type Node = {
  address: string,
  allowedAmount: number
}

export const createTree = (allowList: Node[]) => {
  const leaves = allowList.map(node => ethers.utils.solidityKeccak256(['address', 'uint248'], [node.address, node.allowedAmount]))
  return new MerkleTree(leaves, keccak256, { sortPairs: true })
}

type MultiWalletNode = {
  userId: number,
  address: string,
  allowedAmount: number
}

export const createTreeMultiWallet = (allowList: MultiWalletNode[]) => {
  const leaves = allowList.map(node => ethers.utils.solidityKeccak256(['uint256', 'address', 'uint248'], [node.userId, node.address, node.allowedAmount]))
  return new MerkleTree(leaves, keccak256, { sortPairs: true })
}