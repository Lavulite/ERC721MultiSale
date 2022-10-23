import { MerkleTree } from "merkletreejs"
import { keccak256 } from "@ethersproject/keccak256"
import { ethers } from "hardhat"

type Node = {
  address: string,
  allowedAmount: number
}

const createTree = (allowList: Node[]) => {
  const leaves = allowList.map(node => ethers.utils.solidityKeccak256(['address', 'uint256'], [node.address, node.allowedAmount]))
  return new MerkleTree(leaves, keccak256, { sortPairs: true })
}

export default createTree