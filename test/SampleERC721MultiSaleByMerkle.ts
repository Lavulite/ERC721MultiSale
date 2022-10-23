import deploy from "./deploy"
import createTree from "../utils/merkletree"

import { Signer } from "ethers"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { MerkleTree } from "merkletreejs"
import { SampleERC721MultiSaleByMerkle, SampleNFT } from "../typechain-types";

describe("Merkletree", function () {

  async function deployFixture() {
    const [owner, authorized, unauthorized, others] = await ethers.getSigners()
    const contracts = await deploy(owner)

    return { ...contracts, owner, authorized, unauthorized, others };
  }


  describe("claim", () => {
    it("can claim", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint8,uint256,uint256),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint256'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      expect(await sampleNFT.balanceOf(authorized.address)).to.equals(1)
    })


    it("can not claim", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint8,uint256,uint256),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint256'], [unauthorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(unauthorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .to.be.revertedWith("invalid proof.")
    })
  })


  const claim = async (tree: MerkleTree, sampleERC721MultiSaleByMerkle: SampleERC721MultiSaleByMerkle, owner: Signer, authorized: Signer, sampleNFT: SampleNFT) => {
    await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint8,uint256,uint256),bytes32)"](
      {
        id: 1,
        saleType: 0,
        mintCost: ethers.utils.parseEther("0.001"),
        maxSupply: 10
      }, tree.getHexRoot())).not.to.reverted

    const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint256'], [await authorized.getAddress(), 1]))

    await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.01") }))
      .not.to.be.reverted
  }


  describe("exchange", () => {
    it("can exchange", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])

      await claim(tree, sampleERC721MultiSaleByMerkle, owner, authorized, sampleNFT);

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint8,uint256,uint256),bytes32)"](
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted


      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint256'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([0], 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      expect(await sampleNFT.ownerOf(1)).to.equals(authorized.address)
    })


    it("can not exchange", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree1 = createTree([{ address: authorized.address, allowedAmount: 1 }])

      await claim(tree1, sampleERC721MultiSaleByMerkle, owner, authorized, sampleNFT);

      
      const tree2 = createTree([{ address: owner.address, allowedAmount: 1 }])

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint8,uint256,uint256),bytes32)"](
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree2.getHexRoot())).not.to.reverted


      const proof = tree2.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint256'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([0], 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .to.be.revertedWith("invalid proof.")
    })

  })

})
