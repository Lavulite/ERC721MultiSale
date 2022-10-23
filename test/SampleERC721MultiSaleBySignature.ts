import deploy from "./deploy"
import sign from "../utils/signature"

import { Signer } from "ethers"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { SampleERC721MultiSaleBySignature, SampleNFT } from "../typechain-types"

describe("Signature", function () {

  async function deployFixture() {
    const [owner, authorized, unauthorized, others] = await ethers.getSigners()
    const contracts = await deploy(owner)

    return { ...contracts, owner, authorized, unauthorized, others };
  }

  describe("claim", () => {
    it("can claim", async function () {
      const { sampleNFT, sampleERC721MultiSaleBySignature, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      await expect(sampleERC721MultiSaleBySignature.connect(owner).setCurrentSale(
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        })).not.to.reverted

      const signature = sign(1, authorized.address, 1, owner)

      await expect(sampleERC721MultiSaleBySignature.connect(authorized).claim(1, 1, signature, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

        expect(await sampleNFT.ownerOf(0)).to.equals(authorized.address)
    })


    it("can not claim", async function () {
      const { sampleNFT, sampleERC721MultiSaleBySignature, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      await expect(sampleERC721MultiSaleBySignature.connect(owner).setCurrentSale(
        {
          id: 1,
          saleType: 0,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        })).not.to.reverted

      const signature = sign(1, authorized.address, 1, owner)

      await expect(sampleERC721MultiSaleBySignature.connect(unauthorized).claim(1, 1, signature, { value: ethers.utils.parseEther("0.01") }))
        .to.be.revertedWith("invalid proof.")
    })
  })

  const claim = async (sampleERC721MultiSaleBySignature: SampleERC721MultiSaleBySignature, owner: Signer, authorized: Signer, sampleNFT: SampleNFT) => {
    await expect(sampleERC721MultiSaleBySignature.connect(owner).setCurrentSale(
      {
        id: 1,
        saleType: 0,
        mintCost: ethers.utils.parseEther("0.001"),
        maxSupply: 10
      })).not.to.reverted

    const signature = sign(1, await authorized.getAddress(), 1, owner)

    await expect(sampleERC721MultiSaleBySignature.connect(authorized).claim(1, 1, signature, { value: ethers.utils.parseEther("0.01") }))
      .not.to.be.reverted

    expect(await sampleNFT.balanceOf(await authorized.getAddress())).to.equals(1)
  }


  describe("exchange", () => {
    it("can exchange", async function () {
      const { sampleNFT, sampleERC721MultiSaleBySignature, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      await claim(sampleERC721MultiSaleBySignature, owner, authorized, sampleNFT);

      await expect(sampleERC721MultiSaleBySignature.connect(owner).setCurrentSale(
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        })).not.to.reverted


      const signature = sign(2, authorized.address, 1, owner)

      await expect(sampleERC721MultiSaleBySignature.connect(authorized).exchange([0], 1, signature, { value: ethers.utils.parseEther("0.01") }))
        .not.to.be.reverted

      expect(await sampleNFT.ownerOf(1)).to.equals(authorized.address)
    })


    it("can not exchange", async function () {
      const { sampleNFT, sampleERC721MultiSaleBySignature, owner, authorized, unauthorized, others } = await loadFixture(deployFixture)

      await claim(sampleERC721MultiSaleBySignature, owner, authorized, sampleNFT);

      await expect(sampleERC721MultiSaleBySignature.connect(owner).setCurrentSale(
        {
          id: 2,
          saleType: 1,
          mintCost: ethers.utils.parseEther("0.001"),
          maxSupply: 10
        })).not.to.reverted


      const signature = sign(2, owner.address, 1, owner)

      await expect(sampleERC721MultiSaleBySignature.connect(authorized).exchange([0], 1, signature, { value: ethers.utils.parseEther("0.01") }))
        .to.be.revertedWith("invalid proof.")
    })

  })
})
