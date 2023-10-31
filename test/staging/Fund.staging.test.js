const { assert, expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", function () {
          let deployer
          let fundMe
          let newOwner
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              newOwner = (await getNamedAccounts()).newOwner
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund", async function () {
              const fundTxResponse = await fundMe.fund({ value: sendValue })
              await fundTxResponse.wait(1)

              // second funding with newOwner signer
              const fund2TxResponse = await fundMe
                  .connect(ethers.provider.getSigner(newOwner))
                  .fund({ value: sendValue })
              await fund2TxResponse.wait(1)

              const response = await fundMe.getAddressToAmountFunded(deployer)
              const response2 = await fundMe.getAddressToAmountFunded(newOwner)
              assert.equal(response.add(response2).toString(), sendValue.add(sendValue).toString())
          })

          it("only allows owner to withdraw", async function () {
              // newOwner try to withdraw prior ownership transfer
              const fundConnectedContract = await fundMe.connect(
                  ethers.provider.getSigner(newOwner)
              )
              await expect(fundConnectedContract.withdraw()).to.be.revertedWith(
                  "Function can only be called by the owner"
              )
          })

          it("transfers ownership with the ability to withdraw", async function () {
              await fundMe.connect(ethers.provider.getSigner(deployer)).transferOwnership(newOwner)
              const withdrawTxResponse = await fundMe
                  .connect(ethers.provider.getSigner(newOwner))
                  .withdraw({ gasLimit: 3000000 })
              await withdrawTxResponse.wait(1)

              const endingFundBalance = await fundMe.provider.getBalance(fundMe.address)
              console.log(endingFundBalance.toString() + " should equal 0, running assert equal...")
              assert.equal(endingFundBalance.toString(), "0")
          })

          // it transfer ownership back
          it("transfers ownership back to deployer", async function () {
              const transactionResponse = await fundMe
                  .connect(ethers.provider.getSigner(newOwner))
                  .transferOwnership(deployer)
              await transactionResponse.wait()
              const updatedOwner = await fundMe.getOwner()

              assert.equal(updatedOwner, deployer, "Ownership not transferred properly")
          })
      })
