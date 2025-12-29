'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const params = useParams()
  const locale = params?.locale as string || 'fr'

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/`}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-black text-white mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-zinc-400">Date de révision : Décembre 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="bg-white/5 rounded-2xl p-8 space-y-8 text-zinc-300">
            
            {/* Introduction */}
            <section>
              <p className="text-lg">Bienvenue chez Sugarush !</p>
              <p>Les présentes conditions générales d'utilisation (les "CGU") définissent les conditions juridiquement contraignantes de votre utilisation de sugarush.me et/ou de l'un de nos canaux, plates-formes, produits ou services en ligne, y compris tout le contenu qu'ils contiennent ("Services").</p>
              
              <p>Les Services sont détenus et exploités par [Votre Société], dont l'adresse est [Votre Adresse].</p>
              
              <p>En accédant au site et/ou en utilisant les Services, vous acceptez de vous soumettre aux présentes CGU. Si vous n'êtes pas d'accord avec les présentes CGU, veuillez cesser d'utiliser nos services.</p>
              
              <p>Nos Services sont destinés à un usage personnel et non commercial uniquement. Vous acceptez de ne pas utiliser les Services à des fins commerciales, illégales ou non autorisées.</p>
              
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-6 my-6">
                <h3 className="text-xl font-bold text-white mb-4">⚠️ Points essentiels à garder à l'esprit</h3>
                <ul className="space-y-3 list-disc list-inside">
                  <li><strong>Divertissement uniquement</strong> : Les Services sont destinés à des fins de divertissement. Ils ne sont pas destinés à apporter un soutien émotionnel. Si vous vous sentez en détresse, consultez un professionnel qualifié.</li>
                  
                  <li><strong>Conversations fictives</strong> : Toutes les conversations avec les Compagnons IA sont entièrement fictives. Les compagnons IA ne possèdent pas d'émotions véritables ni la capacité de tenir leurs promesses dans le monde réel.</li>
                  
                  <li><strong>Limites de l'IA</strong> : Les résultats générés peuvent parfois produire un contenu inexact ou ne reflétant pas le jugement humain. Vous êtes responsable de l'évaluation de la pertinence de toute information fournie.</li>
                </ul>
              </div>
            </section>

            {/* 1. Général */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">1. Général</h2>
              <p>Les Services sont une application de chat en ligne qui utilise des algorithmes d'intelligence artificielle ("IA") pour générer des personnages virtuels et fictifs ("Compagnons IA"), avec lesquels vous pouvez discuter. Les Services comprennent également des images, vidéos et scénarios immersifs interactifs.</p>
              
              <p>Vous pouvez choisir un personnage IA avec lequel vous souhaitez parler, puis entamer une conversation.</p>
              
              <p>Nous pouvons retirer des personnages, modifier ou supprimer des fonctions ou du contenu à tout moment et à notre seule discrétion.</p>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">1.1 Compte</h3>
              <p>Certaines parties de nos services nécessitent la création d'un compte avec une adresse électronique et un mot de passe ("Compte"). Vous êtes entièrement responsable de toutes les activités qui se déroulent sous vos identifiants. Votre Compte n'est pas transférable.</p>
              
              <p>Vous acceptez de mettre à jour les informations associées à votre Compte afin qu'elles restent à jour et correctes. Vous acceptez de protéger la confidentialité de votre mot de passe.</p>
              
              <p>Toute violation des présentes CGU peut entraîner l'annulation de votre compte à notre seule discrétion.</p>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">1.2 Abonnement</h3>
              <p>Certains Services sont réservés aux abonnés payants. L'abonnement commencera après le paiement initial. Vous êtes responsable du paiement de tous les frais et taxes liés à la transaction.</p>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">1.3 Sécurité de l'utilisateur</h3>
              <p>Nous donnons la priorité à votre sécurité. En utilisant les Services, vous ne devez pas divulguer d'informations personnelles sensibles (données financières, adresses, mots de passe).</p>
              
              <p>Vous êtes seul responsable de la protection de vos informations personnelles. Nous vous encourageons à signaler tout comportement suspect.</p>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">1.4 Garanties</h3>
              <p>Vous garantissez que :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vous avez l'âge légal (18 ans minimum) pour utiliser les Services</li>
                <li>Vous acceptez ces CGU en votre nom uniquement</li>
                <li>Vous ne devez pas accéder aux Services si vous êtes mineur</li>
              </ul>
            </section>

            {/* 2. Politique à l'égard des mineurs */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">2. Politique à l'égard des mineurs</h2>
              <p>Les Services sont strictement réservés aux adultes de 18 ans et plus. Nous ne collectons pas sciemment de données auprès de mineurs. Si vous avez connaissance qu'un mineur utilise les Services, veuillez nous contacter immédiatement à contact@sugarush.me.</p>
            </section>

            {/* 3. Propriété intellectuelle */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">3. Propriété intellectuelle</h2>
              <p>La propriété intellectuelle des Services et de tout matériel (technologie, fichiers, documents, textes, photos, images, vidéos, logiciels) est détenue par Sugarush ou nous est concédée sous licence.</p>
              
              <p>Nous vous fournissons une licence pour un usage personnel uniquement. Cette licence ne constitue en aucun cas un transfert de titre et sera automatiquement résiliée si vous violez les présentes CGU.</p>
              
              <p>Tous les droits de propriété intellectuelle associés à Sugarush, y compris les personnages IA, le design, les logos et la technologie propriétaire, sont notre propriété exclusive. Il est interdit de reproduire, modifier ou distribuer toute propriété intellectuelle sans autorisation explicite.</p>
            </section>

            {/* 4. Votre contenu */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">4. Votre contenu</h2>
              <p>Vous pouvez fournir des données lors de l'utilisation des Services (chats, prompts visibles dans votre compte privé). Vous conservez vos droits de propriété intellectuelle sur vos données.</p>
              
              <p>Lorsque vous utilisez les Services, vous nous accordez une licence mondiale non exclusive, libre de redevances pour utiliser, distribuer, modifier votre contenu dans le cadre de l'amélioration des Services et du respect de notre Politique de confidentialité.</p>
              
              <p>Cette licence comprend l'utilisation de votre contenu pour former et améliorer nos modèles d'IA, algorithmes et technologie.</p>
            </section>

            {/* 5. Restrictions de comportement */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">5. Restrictions de comportement et de contenu</h2>
              
              <h3 className="text-2xl font-bold text-white mt-6 mb-3">5.1 Règles et restrictions</h3>
              <p>En utilisant les Services, vous acceptez de :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ne pas modifier, traduire ou reformater les Services</li>
                <li>Ne pas décompiler, désassembler ou faire de rétro-ingénierie du logiciel</li>
                <li>Ne pas interférer avec les fonctions de sécurité</li>
                <li>Ne pas utiliser les Services pour obtenir un accès non autorisé à nos systèmes</li>
                <li>Ne pas endommager, surcharger ou perturber nos systèmes</li>
                <li>Ne pas utiliser les Services à des fins illégales ou pour offenser autrui</li>
                <li>Ne pas supprimer les avis de droits d'auteur ou marques déposées</li>
                <li>Respecter toutes les lois applicables</li>
              </ul>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">5.2 Responsabilité relative au contenu</h3>
              <p>Vous êtes seul responsable des résultats générés par les Compagnons IA grâce à vos données. Les Compagnons IA réagissent en fonction des conversations que vous menez. Nous ne contrôlons ni n'approuvons aucun contenu généré par l'IA.</p>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">5.3 Modération et suppression de contenu</h3>
              <p>Nous avons mis en place des contrôles de modération basés sur notre technologie IA pour assurer la conformité avec nos CGU. Si nos contrôles détectent une violation, nous pouvons accéder au contenu signalé, l'examiner et prendre les mesures appropriées (suppression, résiliation de compte, signalement aux autorités).</p>
              
              <p>Nous nous réservons le droit de rejeter ou supprimer tout contenu qui enfreint nos Politiques. Les violations répétées peuvent entraîner des restrictions de compte. Les utilisateurs ne seront pas remboursés pour les actions de modération.</p>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">5.4 Rapport sur les contenus interdits</h3>
              <p>Nous appliquons une politique de tolérance zéro à l'égard du matériel pédopornographique. Toute tentative de création de tel contenu est interdite et sera signalée aux autorités compétentes.</p>
            </section>

            {/* 6. Paiements */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">6. Paiements et renouvellement automatique</h2>
              <p>Certains Services nécessitent un abonnement payant, qui peut être facturé mensuellement, trimestriellement ou annuellement. Les paiements sont acceptés par carte de crédit ou autres méthodes disponibles.</p>
              
              <p>Les abonnements sont renouvelés automatiquement à la fin de chaque période pour une durée identique. Le renouvellement automatique peut être annulé à tout moment dans vos paramètres.</p>
            </section>

            {/* 7. Politique d'exécution */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">7. Annulation et remboursement</h2>
              
              <h3 className="text-2xl font-bold text-white mt-6 mb-3">7.1 Annulation</h3>
              <p>Vous pouvez annuler votre abonnement à tout moment dans Paramètres. Si vous choisissez l'annulation, votre abonnement restera actif jusqu'à la fin de la période en cours.</p>

              <h3 className="text-2xl font-bold text-white mt-6 mb-3">7.2 Politique de remboursement</h3>
              <p>Vous disposez de 24 heures après votre paiement pour demander un remboursement. Aucun remboursement ne sera effectué après ce délai ou si vous avez utilisé plus de 20 messages.</p>
              
              <p>Vous ne serez pas remboursé pour tout contenu retiré ou mesures de modération prises en réponse à des violations de nos Politiques.</p>
              
              <p>Nous ne remboursons pas en cas de modification du contenu ou des fonctionnalités de la plateforme qui ne modifient pas les services de base.</p>
            </section>

            {/* 8. Garanties et responsabilité */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">8. Aucune garantie</h2>
              <p>Le contenu est généré par l'IA et créé à la demande. Il existe des limites inhérentes à la technologie de l'IA. Le contenu peut ne pas être exact ou ne pas correspondre parfaitement à vos attentes.</p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 my-6">
                <p className="font-bold uppercase">Les Services vous sont fournis "EN L'ÉTAT" et "TELS QUE DISPONIBLES".</p>
                
                <p className="mt-4">Nous ne garantissons pas que :</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Les Services seront exempts d'erreurs, sûrs ou ininterrompus</li>
                  <li>Les Services répondront à vos exigences</li>
                  <li>Les résultats seront exacts ou fiables</li>
                  <li>Toute erreur sera corrigée</li>
                </ul>
                
                <p className="mt-4">Nous ne serons en aucun cas responsables de dommages directs, indirects, spéciaux, consécutifs ou punitifs, y compris la perte de bénéfices, résultant de votre utilisation des Services.</p>
              </div>
            </section>

            {/* 9. Liens tiers */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">9. Liens vers des sites tiers</h2>
              <p>Les Services peuvent inclure des liens vers des sites web de tiers. Leur présence ne signifie pas qu'ils sont recommandés par nous. Nous n'assumons aucune responsabilité pour les dommages résultant de l'utilisation de ces sites tiers.</p>
              
              <p>Il vous incombe de vous assurer que tout ce que vous téléchargez est exempt de virus ou autres éléments destructeurs.</p>
            </section>

            {/* 10. Droit applicable */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">10. Droit applicable et litiges</h2>
              <p>Les présentes CGU sont régies par les lois françaises. Tout litige sera soumis aux tribunaux compétents de France.</p>
            </section>

            {/* 11. Modifications */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">11. Modifications des CGU</h2>
              <p>Nous nous réservons le droit de mettre à jour ou modifier les présentes CGU à tout moment. Les modifications entrent en vigueur immédiatement dès leur publication.</p>
              
              <p>Veuillez consulter régulièrement cette page. Si vous continuez à utiliser les Services après publication de modifications, cela signifie que vous acceptez ces modifications.</p>
            </section>

            {/* 12. Résiliation */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">12. Résiliation et cession</h2>
              <p>Ces CGU demeurent en vigueur jusqu'à résiliation par vous ou par nous. Vous pouvez résilier en cessant d'utiliser les Services et en annulant votre abonnement.</p>
              
              <p>Nous pouvons résilier votre accès à tout moment, avec ou sans préavis, pour tout motif, y compris la violation des présentes CGU.</p>
              
              <p>Nous nous réservons le droit d'assigner ou transférer les Services à des tiers.</p>
            </section>

            {/* 13. Divers */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">13. Dispositions diverses</h2>
              <p>Si une disposition des présentes CGU est jugée invalide, cela n'affectera pas la validité des autres dispositions.</p>
              
              <p>Ces CGU constituent l'intégralité des accords avec nous quant à votre utilisation des Services.</p>
              
              <p>Nous collecterons et traiterons vos informations conformément à notre Politique de confidentialité.</p>
            </section>

            {/* Contact */}
            <section className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📧 Besoin d'aide ?</h2>
              <p>Si vous avez des questions concernant ces CGU, contactez-nous à : <a href="mailto:contact@sugarush.me" className="text-pink-500 hover:text-pink-400">contact@sugarush.me</a></p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
