import deploy from "./deploy"
import { createTree } from "../utils/merkletree"

import { Signer } from "ethers"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { MerkleTree } from "merkletreejs"
import { SampleERC721MultiSaleByMerkle, SampleNFT } from "../typechain-types";

describe("Merkletree", function () {

  async function deployFixture() {
    const [owner, authorized, unauthorized, ...others] = await ethers.getSigners()
    const contracts = await deploy(owner)

    return { ...contracts, owner, authorized, unauthorized, others };
  }


  describe("claim", () => {
    it("can claim", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      expect(await sampleNFT.balanceOf(authorized.address)).to.equals(1)
    })

    it("can not claim: invalid proof", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [unauthorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(unauthorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .to.be.revertedWith("invalid proof.")
    })

    it("can not claim: enough eth", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.0009") }))
        .to.be.revertedWith("not enough eth.")
    })

    it("can not claim: over AL", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.001") }))
        .not.to.be.reverted
      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.001") }))
        .to.be.revertedWith("claim is over allowed amount.")
    })

    it("can not claim: over max supplay on sale", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree(others.map(account => { return { address: account.address, allowedAmount: 5 } }))
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      for (const i of [0, 1]) {
        const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [others[i].address, 5]))
        await expect(sampleERC721MultiSaleByMerkle.connect(others[i]).claim(5, 5, proof, { value: ethers.utils.parseEther("0.005") }))
          .not.to.be.reverted
      }

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [others[2].address, 5]))
      await expect(sampleERC721MultiSaleByMerkle.connect(others[2]).claim(1, 5, proof, { value: ethers.utils.parseEther("0.001") }))
        .to.be.revertedWith("claim is over the max sale supply.")
    })


    it("can not claim: over max supplay of collection", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree(others.map(account => { return { address: account.address, allowedAmount: 30 } }))
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 300
        }, tree.getHexRoot())).not.to.reverted

      for (const i of [0, 1, 2]) {
        const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [others[i].address, 30]))
        await expect(sampleERC721MultiSaleByMerkle.connect(others[i]).claim(30, 30, proof, { value: ethers.utils.parseEther("0.03") }))
          .not.to.be.reverted
      }

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [others[3].address, 30]))
      await expect(sampleERC721MultiSaleByMerkle.connect(others[3]).claim(11, 30, proof, { value: ethers.utils.parseEther("0.011") }))
        .to.be.revertedWith("claim is over the max supply.")
    })
  })


  const claim = async (tree: MerkleTree, sampleERC721MultiSaleByMerkle: SampleERC721MultiSaleByMerkle, owner: Signer, authorized: Signer, sampleNFT: SampleNFT) => {
    await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
      {
        id: 1,
        saleType: 0,
        mintCost: ethers.utils.parseEther("0.001"),
        maxSupply: 10
      }, tree.getHexRoot())).not.to.reverted

    const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [await authorized.getAddress(), 1]))

    await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(1, 1, proof, { value: ethers.utils.parseEther("0.01") }))
      .not.to.be.reverted
  }


  describe("exchange", () => {
    it("can exchange", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])

      await claim(tree, sampleERC721MultiSaleByMerkle, owner, authorized, sampleNFT);

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted


      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([0], 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      expect(await sampleNFT.ownerOf(1)).to.equals(authorized.address)
    })


    it("can not exchange: invalid proof", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree1 = createTree([{ address: authorized.address, allowedAmount: 1 }])

      await claim(tree1, sampleERC721MultiSaleByMerkle, owner, authorized, sampleNFT);

      const tree2 = createTree([{ address: owner.address, allowedAmount: 1 }])

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree2.getHexRoot())).not.to.reverted


      const proof = tree2.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([0], 1, proof, { value: ethers.utils.parseEther("0.01") }))
        .to.be.revertedWith("invalid proof.")
    })

    it("can not exchange: enough eth", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 1 }])

      await claim(tree, sampleERC721MultiSaleByMerkle, owner, authorized, sampleNFT);

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 1]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([0], 1, proof, { value: ethers.utils.parseEther("0.0009") }))
        .to.be.revertedWith("not enough eth.")
    })

    it("can not exchange: over AL", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree1 = createTree([{ address: authorized.address, allowedAmount: 10 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree1.getHexRoot())).not.to.reverted

      const proof1 = tree1.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 10]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(10, 10, proof1, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted


      const tree2 = createTree([{ address: authorized.address, allowedAmount: 5 }])

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree2.getHexRoot())).not.to.reverted

      const proof2 = tree2.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 5]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([0, 1, 2, 3, 4], 5, proof2, { value: ethers.utils.parseEther("0.005") }))
        .not.to.be.reverted
      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([6], 5, proof2, { value: ethers.utils.parseEther("0.005") }))
        .to.be.revertedWith("claim is over allowed amount.")
    })

    it("can not exchange: over max supplay on sale", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 10 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 10]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(10, 10, proof, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 5
        }, tree.getHexRoot())).not.to.reverted

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([0, 1, 2, 3, 4], 10, proof, { value: ethers.utils.parseEther("0.005") }))
        .not.to.be.reverted
      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).exchange([5], 10, proof, { value: ethers.utils.parseEther("0.005") }))
        .to.be.revertedWith("claim is over the max sale supply.")
    })
  })

  describe("counting functions", () => {
    it("getBuyCount", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 10 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 10]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(5, 10, proof, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      expect(await sampleERC721MultiSaleByMerkle.connect(authorized).getBuyCount()).to.equals(5)

      expect(await sampleNFT.balanceOf(authorized.address)).to.equals(5)
    })

    it("reset next sale", async function () {
      const { sampleNFT, sampleERC721MultiSaleByMerkle, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      const tree = createTree([{ address: authorized.address, allowedAmount: 10 }])
      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      const proof = tree.getHexProof(ethers.utils.solidityKeccak256(['address', 'uint248'], [authorized.address, 10]))

      await expect(sampleERC721MultiSaleByMerkle.connect(authorized).claim(5, 10, proof, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      await expect(sampleERC721MultiSaleByMerkle.connect(owner)["setCurrentSale((uint8,uint248,uint248,uint8),bytes32)"](
        {
          id: 2,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        }, tree.getHexRoot())).not.to.reverted

      expect(await sampleERC721MultiSaleByMerkle.connect(authorized).getBuyCount()).to.equals(0)
    })
  })
})
