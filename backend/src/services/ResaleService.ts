import { BookRepository } from '../repositories/BookRepository';
import { ApprovalStatus } from '@prisma/client';

/**
 * ResaleService — handles the admin approval workflow for used book listings.
 * Previously a dead stub; now wired to the real BookRepository.
 */
export class ResaleService {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  /**
   * Approve a used book listing and make it publicly visible.
   */
  public async approveListing(bookId: string) {
    return this.bookRepository.updateApprovalStatus(bookId, ApprovalStatus.APPROVED);
  }

  /**
   * Reject a used book listing, preventing it from appearing in the marketplace.
   */
  public async rejectListing(bookId: string) {
    return this.bookRepository.updateApprovalStatus(bookId, ApprovalStatus.REJECTED);
  }
}
