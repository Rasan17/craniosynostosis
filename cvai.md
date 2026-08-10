# **CVAI = Cranial Vault Asymmetry Index.** It quantifies *asymmetry*, so it belongs to plagiocephaly. Scaphocephaly is captured by the cranial index, not by CVAI.
The three deformities are three distinct geometric properties, and each needs its own metric:
| **Deformity** | **Geometric abnormality** | **Metric** | **Direction** |
|:-:|:-:|:-:|:-:|
| Plagiocephaly | Asymmetry — parallelogram distortion | **CVAI** | ↑ |
| Brachycephaly | Too wide for its length | **CI** | ↑ |
| Scaphocephaly / dolichocephaly | Too narrow for its length | **CI** | ↓ |
CI is computed from two orthogonal diameters through the midline, so it is **blind to asymmetry** — a markedly plagiocephalic head can have a perfectly normal CI. CVAI is computed from two oblique diagonals, so it is **blind to overall proportion**. They are independent, which is why a calculator needs both: combined deformational brachycephaly *and* plagiocephaly is the commonest clinical presentation.
**How CVAI is measured.** Two diagonals taken at 30° either side of the midline (some protocols use 40°), then:
CVAI (%) = (longer diagonal − shorter diagonal) ÷ shorter diagonal × 100
Conventional bands: <3.5% normal, 3.5–6.25% mild, 6.25–8.75% moderate, >8.75% severe. The related **CVA** is simply the absolute difference in millimetres, unnormalised.
One trap if you're implementing it: **the denominator convention is not uniform.** Some publications divide by the longer diagonal rather than the shorter, which yields systematically smaller values and shifts every threshold. Also fix your diagonal angle — 30° and 40° protocols are not interchangeable. Both should be stated on the output alongside the reference set, for the same reason you're naming the CI reference.
Two clinical points worth encoding:
**A normal CVAI does not reassure in scaphocephaly.** Sagittal synostosis is a symmetric deformity, so CVAI stays normal while CI falls. If a user relies on CVAI as a general "head shape abnormal?" screen, this is the case they will miss.
**CVAI cannot distinguish deformational from synostotic plagiocephaly.** Both raise it. The discrimination is morphological, not metric: deformational posterior plagiocephaly gives a **parallelogram** — ipsilateral occipital flattening with *ipsilateral* frontal bossing and anterior ear displacement. Lambdoid synostosis gives a **trapezoid** — with *contralateral* frontal bossing and an ipsilateral mastoid bulge. No index captures that; it needs examination.
So your calculator wants four measurements — OFD, BPD, and the two obliques — feeding two independent indices that answer different questions.
Happy to extend the vertex-view diagram to show the 30° diagonals and the parallelogram-versus-trapezoid distinction, if that would be useful for the tool's help screen.
